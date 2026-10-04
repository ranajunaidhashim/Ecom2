import Product from '@/models/Product';

/**
 * Validates cart items against the DB and computes the authoritative total
 * server-side (never trust client-sent prices). Shared by every payment
 * provider's checkout route so pricing logic can't drift between them.
 */
import Discount from '@/models/Discount';

export async function buildOrderItems(items, discountCode = null) {
  let subtotal = 0;
  let shippingCost = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variant = product.variants.id(item.variantId);
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
    
    // Sum per-item shipping (× quantity) to match the client-side total the
    // customer is shown in the cart and checkout summary (CartContext.jsx's
    // cartShippingCost). This used to take the max of a single item's
    // shipping cost instead of summing, so multi-item orders were charged
    // less than what the customer saw and agreed to pay.
    shippingCost += (product.shippingCost || 0) * item.quantity;
  }

  let discountAmount = 0;
  if (discountCode) {
    const discount = await Discount.findOne({ code: discountCode, isActive: true });
    if (discount) {
      if (discount.discountType === 'percentage') {
        discountAmount = subtotal * (discount.value / 100);
      } else if (discount.discountType === 'fixed') {
        discountAmount = discount.value;
      }
      // Ensure we don't discount more than the subtotal itself
      discountAmount = Math.min(discountAmount, subtotal);
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount) + shippingCost;

  return { orderItems, subtotal, discountAmount, shippingCost, totalAmount };
}
