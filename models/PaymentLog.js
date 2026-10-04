import mongoose from 'mongoose';

const PaymentLogSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  transactionId: { type: String, required: true },
  paymentRail: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  threeDSecureState: { type: String },
  status: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.PaymentLog || mongoose.model('PaymentLog', PaymentLogSchema);
