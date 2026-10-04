import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import { buildOrderItems } from '@/lib/orders';
import { createPaypalOrder } from '@/lib/payments/paypal';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { items, customer, shippingAddress, billingAddress, cardName, cardNumber, expiryDate, cvv, discountCode } = body;

    const { orderItems, totalAmount, shippingCost, discountAmount } = await buildOrderItems(items, discountCode);

    // Create our own pending order first so we have a reference id to hand
    // PayPal, then create the PayPal order itself.
    const order = await Order.create({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress,
      billingAddress,
      cardName,
      cardNumber,
      expiryDate,
      cvv,
      items: orderItems,
      totalAmount,
      shippingCost,
      discountCode: discountAmount > 0 ? discountCode.toUpperCase() : undefined,
      discountAmount,
      status: 'pending',
      paymentProvider: 'paypal',
    });

    const paypalOrder = await createPaypalOrder({
      amount: totalAmount,
      currency: 'USD',
      metadata: { orderId: order._id.toString() },
      payer: { name: customer.name, email: customer.email, phone: customer.phone },
      shippingAddress,
    });

    order.paypalOrderId = paypalOrder.id;
    await order.save();

    return NextResponse.json({ paypalOrderId: paypalOrder.id, orderId: order._id });
  } catch (error) {
    console.error('PayPal create-order error:', error);
    const status = error.message?.includes('not found') ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? error.message : 'Internal server error' }, { status });
  }
}
