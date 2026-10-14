import Product from '@/models/Product';

/**
 * Validates cart items against the DB and computes the authoritative total
 * server-side (never trust client-sent prices). Shared by every payment
 * provider's checkout route so pricing logic can't drift between them.
 */
import Discount from '@/models/Discount';

export async function buildOrderItems(items, discountCode = null) {
  if (!items || items.length === 0) {
    throw new Error('No items provided in order');
  }

  const productIds = [...new Set(items.map((i) => i.productId))];

  const [products, discount] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).lean(),
    discountCode ? Discount.findOne({ code: discountCode.toUpperCase(), isActive: true }).lean() : null,
  ]);

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  let shippingCost = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId?.toString());
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variant = product.variants?.find((v) => v._id?.toString() === item.variantId?.toString());
    if (!variant) {
      throw new Error(`Variant not found: ${item.variantId}`);
    }

    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      quantity: item.quantity,
      price: variant.price,
    });

    shippingCost += (product.shippingCost || 0) * item.quantity;
  }

  let discountAmount = 0;
  if (discount) {
    if (discount.discountType === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.discountType === 'fixed') {
      discountAmount = discount.value;
    }
    // Ensure we don't discount more than the subtotal itself
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const totalAmount = Math.max(0, subtotal - discountAmount) + shippingCost;

  return { orderItems, subtotal, discountAmount, shippingCost, totalAmount };
}
