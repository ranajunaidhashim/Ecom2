/**
 * Minimal PayPal REST (Orders API v2) wrapper.
 *
 * PayPal's own hosted Checkout handles card payments for buyers who don't
 * have (or don't want to use) a PayPal account — the "Debit or Credit Card"
 * option appears automatically alongside the PayPal button as long as the
 * merchant's PayPal Business account has guest checkout enabled (an
 * account-level setting on paypal.com, not something this code controls).
 * PayPal only asks for 3-D Secure / SCA when the card issuer or local
 * regulation requires it, so plain non-3DS cards go through normally.
 *
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 */
const BASE = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

let _token = null;
let _tokenExp = 0;

async function getAccessToken() {
  if (_token && Date.now() < _tokenExp) return _token;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  _token = data.access_token;
  _tokenExp = Date.now() + (data.expires_in - 60) * 1000; // refresh a bit early
  return _token;
}

/**
 * Create a PayPal order for the given amount. Returns the PayPal order id
 * used by the client-side buttons to render the approval flow.
 */
export async function createPaypalOrder({ amount, currency = 'USD', metadata = {}, payer, shippingAddress }) {
  const token = await getAccessToken();
  
  let nameParts = [];
  if (payer && payer.name) {
    nameParts = payer.name.split(' ');
  }

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: metadata.orderId || undefined,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      },
    ],
  };

  if (payer && payer.email) {
    payload.payer = {
      email_address: payer.email,
    };
    if (nameParts.length > 0) {
      payload.payer.name = {
        given_name: nameParts[0],
        surname: nameParts.slice(1).join(' ') || undefined,
      };
    }
  }

  if (shippingAddress) {
    payload.purchase_units[0].shipping = {
      name: { full_name: payer?.name || '' },
      address: {
        address_line_1: shippingAddress.line1,
        admin_area_2: shippingAddress.city,
        admin_area_1: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country_code: shippingAddress.country,
      }
    };
  }

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PayPal order creation failed: ${res.status} ${errBody}`);
  }

  return res.json();
}

/** Capture (charge) a previously-approved PayPal order. */
export async function capturePaypalOrder(paypalOrderId) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${errBody}`);
  }

  return res.json();
}
