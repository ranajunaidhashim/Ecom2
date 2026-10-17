import { WhopClient } from '@whop/sdk';

export async function createWhopSession({ amount, orderId, customer, items, origin }) {
  try {
    const apiKey = process.env.WHOP_API_KEY;
    const accountId = process.env.WHOP_COMPANY_ID;
    const client = new WhopClient({ token: apiKey });

    const config = await client.checkoutConfigurations.create({
      account_id: accountId,
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
