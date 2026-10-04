/**
 * Minimal Airwallex REST wrapper. Airwallex is used as a secondary global
 * acquirer and for local rails (SEPA/iDEAL/Bancontact/UK Pay-by-Bank) in
 * regions where it prices better than Stripe.
 *
 * Docs: https://www.airwallex.com/docs/api
 */
const BASE = process.env.AIRWALLEX_BASE_URL || 'https://api.airwallex.com';

let _token = null;
let _tokenExp = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExp) return _token;
  const res = await fetch(`${BASE}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID,
      'x-api-key': process.env.AIRWALLEX_API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Airwallex auth failed: ${res.status}`);
  const data = await res.json();
  _token = data.token;
  _tokenExp = Date.now() + 25 * 60 * 1000; // tokens last ~30m
  return _token;
}

export async function createAirwallexIntent({ amount, currency, methods, metadata = {} }) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/v1/pa/payment_intents/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      request_id: crypto.randomUUID(),
      amount,
      currency,
      merchant_order_id: metadata.orderNumber,
      // Force 3DS on cards for the liability shift.
      payment_method_options: {
        card: { three_ds_action: 'FORCE_3DS' },
      },
      metadata,
    }),
  });
  if (!res.ok) throw new Error(`Airwallex intent failed: ${res.status}`);
  return res.json();
}

/**
 * Verify Airwallex webhook HMAC signature.
 * Header: `x-signature` = HMAC-SHA256(timestamp + rawBody, endpoint_secret).
 */
export async function verifyAirwallexWebhook(rawBody, timestamp, signature) {
  const crypto = await import('node:crypto');
  const expected = crypto
    .createHmac('sha256', process.env.AIRWALLEX_WEBHOOK_SECRET)
    .update(timestamp + rawBody)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
