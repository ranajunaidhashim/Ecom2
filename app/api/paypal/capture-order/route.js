import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { capturePaypalOrder } from '@/lib/payments/paypal';

export async function POST(req) {
  try {
    await dbConnect();
    const { paypalOrderId } = await req.json();
    if (!paypalOrderId) {
      return NextResponse.json({ error: 'Missing paypalOrderId' }, { status: 400 });
    }

    const capture = await capturePaypalOrder(paypalOrderId);
    const succeeded = capture.status === 'COMPLETED';

    const order = await Order.findOneAndUpdate(
      { paypalOrderId },
      { status: succeeded ? 'paid' : 'pending' },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (succeeded) {
      await PaymentLog.create({
        orderId: order._id,
        transactionId: capture.id || paypalOrderId,
        paymentRail: 'paypal',
        amount: order.totalAmount,
        currency: 'USD',
        threeDSecureState: 'not_supported',
        status: 'succeeded',
        metadata: { paypalOrderId },
      });
    }

    return NextResponse.json({ success: succeeded, orderId: order._id });
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
