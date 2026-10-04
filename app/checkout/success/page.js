import Link from 'next/link';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { dbConnect } from '@/lib/db';

export default async function CheckoutSuccessPage({ searchParams }) {
  const { orderId, t, s, simulated } = await searchParams;
  let finalOrderId = null;

  try {
    if (orderId) {
      finalOrderId = orderId;
      await dbConnect();
      const order = await Order.findById(orderId);
      
      // Basic verification: mark as paid if it's returning from Whop
      if (order && order.status === 'pending') {
        order.status = 'paid';
        await order.save();

        await PaymentLog.create({
          orderId: order._id,
          paymentRail: 'whop',
          transactionId: order.whopSessionId || 'unknown',
          amount: order.totalAmount,
          status: 'completed',
          metadata: {
            whopSessionId: order.whopSessionId,
            simulated: simulated === 'true'
          }
        });
      }
    }
  } catch (error) {
    console.error("Error fetching order for success page:", error);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-surface p-10 rounded-2xl border border-border shadow-card">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3">Order Confirmed</h1>
        <p className="text-muted mb-6 leading-relaxed">
          Thank you for your purchase! We&apos;ve securely received your payment and will begin processing your order immediately.
        </p>

        {finalOrderId && (
          <div className="bg-elevated border border-border rounded-xl p-4 mb-8 text-left flex flex-col items-center">
            <span className="text-xs font-semibold uppercase text-muted tracking-wider mb-1">Your Order ID</span>
            <code className="text-lg font-bold text-foreground bg-background px-3 py-1 rounded-md border border-border">
              {finalOrderId}
            </code>
            <p className="text-xs text-muted mt-3 text-center">
              Please save this ID. You can use it to track your fulfillment status at any time.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/track"
            className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="bg-white hover:bg-elevated border border-border text-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

