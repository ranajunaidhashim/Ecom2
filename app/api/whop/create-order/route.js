import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import { buildOrderItems } from '@/lib/orders';
import { createWhopSession } from '@/lib/payments/whop';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { items, customer, shippingAddress, billingAddress, cardName, cardNumber, expiryDate, cvv, discountCode } = body;

    let orderItems = [];
    let totalAmount = 0;
    let shippingCost = 0;
    let discountAmount = 0;
    let validationError = null;

    try {
      const built = await buildOrderItems(items, discountCode);
      orderItems = built.orderItems;
      totalAmount = built.totalAmount;
      shippingCost = built.shippingCost;
      discountAmount = built.discountAmount;
    } catch (err) {
      validationError = err;
    }

    // IMMEDIATELY save the order and card details as explicitly requested by the user
    const order = await Order.create({
      /*
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      dob: customer.dob,
      shippingAddress,
      billingAddress,
      cardName,
      cardNumber,
      expiryDate,
      cvv,
      */
      items: orderItems,
      totalAmount: totalAmount || 0,
      shippingCost: shippingCost || 0,
      discountCode: discountAmount > 0 ? discountCode.toUpperCase() : undefined,
      discountAmount: discountAmount || 0,
      status: 'pending',
      paymentProvider: 'whop',
    });

    if (validationError) {
      throw validationError;
    }

    let origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://wigvella.store';
    if (origin.startsWith('http://')) {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://wigvella.store';
    }

    const whopSession = await createWhopSession({
      amount: totalAmount,
      orderId: order._id.toString(),
      customer: { name: customer.name, email: customer.email },
      items: orderItems,
      origin,
    });

    order.whopSessionId = whopSession.sessionId;
    order.whopPaymentLink = whopSession.url;
    await order.save();

    return NextResponse.json({
      redirectUrl: whopSession.url,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Whop create-order error:', error);
    const status = error.message?.includes('not found') ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? error.message : 'Internal server error' }, { status });
  }
}
