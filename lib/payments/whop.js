import { WhopClient } from '@whop/sdk';

const WHOP_API_KEY = process.env.WHOP_API_KEY;
// Hardcoded company and product IDs found from the account
const WHOP_ACCOUNT_ID = process.env.WHOP_COMPANY_ID || 'biz_0w90gSPGYs0PNA';
const WHOP_PRODUCT_ID = 'prod_bOEreup8ct34G';

const client = new WhopClient({ token: WHOP_API_KEY });

export async function createWhopSession({ amount, orderId, customer, items, origin }) {
  try {
    const config = await client.checkoutConfigurations.create({
      account_id: WHOP_ACCOUNT_ID,
      payment_method_configuration: {
        enabled: ['card'],
        disabled: ['apple_pay', 'google_pay', 'crypto', 'ach', 'bank_wire']
      },
      plan: {
        title: `Order ${orderId}`,
        initial_price: amount,
        plan_type: 'one_time',
        currency: 'usd'
      },
      metadata: {
        order_id: orderId
      },
      redirect_url: `${origin}/checkout/success?orderId=${orderId}`
    });

    return {
      url: config.purchase_url,
      sessionId: config.id
    };
  } catch (error) {
    console.error('Whop SDK Error:', error.message || error);
    throw new Error(`Failed to create Whop checkout session: ${error.message || 'Unknown error'}`);
  }
}
