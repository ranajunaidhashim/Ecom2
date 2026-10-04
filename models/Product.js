import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "Rose - 50ml", "Blue", "Default"
  sku: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    default: 'other',
    index: true,
  },
  images: [{ type: String }],
  variants: [VariantSchema],
  tags: [{ type: String }],
  shippingCost: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'dsers', 'cj'], default: 'manual' },
  supplier: {
    name: { type: String },
    externalId: { type: String },
    productUrl: { type: String },
  },
  pricingRule: { type: mongoose.Schema.Types.Mixed },
  lastSyncedAt: { type: Date },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
