/**
 * Decide which payment methods and currency to OFFER a buyer based on geo.
 *
 * Design note: we OFFER localized methods because they convert better and are
 * cheaper to accept — not to strip anyone of recourse. Cards always remain
 * available worldwide (that's your "no customer turned away" requirement), and
 * every card payment is put through 3-D Secure for a genuine liability shift on
 * unauthorized-use fraud.
 */

const EU_SEPA = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const CURRENCY_BY_COUNTRY = {
  US: 'usd', GB: 'gbp',
  // Eurozone
  AT: 'eur', BE: 'eur', HR: 'eur', CY: 'eur', EE: 'eur', FI: 'eur', FR: 'eur',
  DE: 'eur', GR: 'eur', IE: 'eur', IT: 'eur', LV: 'eur', LT: 'eur', LU: 'eur',
  MT: 'eur', NL: 'eur', PT: 'eur', SK: 'eur', SI: 'eur', ES: 'eur',
};

/**
 * @returns {{ currency: string, methods: string[], primary: string }}
 */
export function routePayment(countryCode) {
  const cc = (countryCode || '').toUpperCase();
  const currency = CURRENCY_BY_COUNTRY[cc] || 'usd';

  // Cards are always offered (universal coverage). Region-specific rails are
  // added where they exist and convert well.
  const methods = ['card'];

  if (cc === 'GB') {
    // UK bank-transfer rail (Pay by Bank / Open Banking) via your PSP.
    methods.unshift('open_banking');
  } else if (cc === 'NL') {
    methods.unshift('ideal');
  } else if (cc === 'BE') {
    methods.unshift('bancontact');
  } else if (EU_SEPA.has(cc)) {
    methods.unshift('sepa_debit');
  }

  return { currency, methods, primary: methods[0] };
}

/**
 * Map our internal method names to Stripe PaymentIntent payment_method_types.
 */
export function toStripeMethodTypes(methods) {
  const map = {
    card: 'card',
    ideal: 'ideal',
    bancontact: 'bancontact',
    sepa_debit: 'sepa_debit',
    // "Pay by Bank" (UK Open Banking) — availability depends on your Stripe
    // account/region enablement.
    open_banking: 'pay_by_bank',
  };
  return methods.map((m) => map[m]).filter(Boolean);
}
