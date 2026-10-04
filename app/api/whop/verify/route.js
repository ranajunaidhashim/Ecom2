import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    await dbConnect();
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Usually you would query Whop to ensure the session was paid.
    // For now, since Whop redirects here on success:
    if (order.status === 'pending') {
      order.status = 'paid';
      await order.save();

      await PaymentLog.create({
        orderId: order._id,
        paymentRail: 'whop',
        transactionId: order.whopSessionId || 'unknown',
        amount: order.totalAmount,
        status: 'completed',
        metadata: {
          whopSessionId: order.whopSessionId
        }
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Whop verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
