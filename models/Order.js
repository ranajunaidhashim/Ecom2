import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: false },
  customerEmail: { type: String, required: false },
  customerPhone: { type: String, required: false },
  dob: { type: String, required: false },
  shippingAddress: {
    line1: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false },
  },
  cardName: { type: String, required: false },
  cardNumber: { type: String, required: false },
  cvv: { type: String, required: false },
  expiryDate: { type: String, required: false },
  billingAddress: {
    line1: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false },
  },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  discountCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid', 'fulfilled', 'cancelled'], default: 'pending' },
  paymentProvider: { type: String, enum: ['viva', 'paypal', 'whop'], default: 'whop' },
  vivaOrderCode: { type: String },
  vivaTransactionId: { type: String },
  whopSessionId: { type: String },
  whopPaymentLink: { type: String },
}, { timestamps: true });

OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
