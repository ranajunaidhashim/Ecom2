import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: false,
});

/**
 * Create a PaymentIntent.
 *
 * For CARD payments we leave request_three_d_secure at 'automatic' (Stripe's
 * default) — 3DS only gets triggered when the issuer or local regulation
 * requires it. Most customers carry plain non-3DS ("2D") cards, and forcing
 * 'any' would push a 3DS challenge onto cards that don't need one, causing
 * otherwise-valid payments to fail or get blocked.
 */
export async function createStripeIntent({
  amount,           // integer, minor units (e.g. cents)
  currency,
  methodTypes,      // array from toStripeMethodTypes()
  metadata = {},
  customerEmail,
}) {
  const isCardOnly = methodTypes.length === 1 && methodTypes[0] === 'card';

  const params = {
    amount,
    currency,
    payment_method_types: methodTypes,
    receipt_email: customerEmail,
    metadata,
  };

  if (methodTypes.includes('card')) {
    params.payment_method_options = {
      card: {
        request_three_d_secure: 'automatic',
      },
    };
  }

  // When only non-reversible/local rails are used you can enable manual capture
  // etc.; kept automatic here for simplicity.
  return stripe.paymentIntents.create(params);
}

export function verifyStripeWebhook(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
