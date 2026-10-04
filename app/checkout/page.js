import { headers } from 'next/headers';
import CheckoutForm from './CheckoutForm';

export default async function CheckoutPage() {
  const h = await headers();
  const geoCountry = h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || 'US';

  return <CheckoutForm geoCountry={geoCountry} />;
}
