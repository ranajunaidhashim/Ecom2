/**
 * Dynamic pricing. Apply a rule to a supplier cost to get the retail price.
 *
 *   multiplier   -> cost * value            (e.g. value 2 => Cost x 2)
 *   margin       -> cost / (1 - value)      (value is target margin 0..1)
 *   fixed_markup -> cost + value
 */
export function applyPricing(cost, rule = { type: 'multiplier', value: 2 }) {
  const c = Number(cost) || 0;
  const v = Number(rule.value) || 0;

  let price;
  switch (rule.type) {
    case 'margin':
      price = v >= 1 ? c : c / (1 - v);
      break;
    case 'fixed_markup':
      price = c + v;
      break;
    case 'multiplier':
    default:
      price = c * (v || 1);
      break;
  }

  // Round to a charm price ending in .99 (common dropship convention).
  return Math.max(0, Math.round(price) - 0.01);
}
