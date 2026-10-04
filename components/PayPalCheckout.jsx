'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export default function PayPalCheckout({ cart, customer, address, billingAddress, cardName, cardNumber, expiryDate, cvv, discountCode, onSuccess }) {
  const [error, setError] = useState('');

  // Returns the PayPal order id (string) that the Smart Buttons use to open
  // the approval flow. Our server validates prices against the DB first.
  const createOrder = async () => {
    setError('');
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customer,
        shippingAddress: address,
        billingAddress,
        cardName,
        cardNumber,
        expiryDate,
        cvv,
        discountCode,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.paypalOrderId) {
      throw new Error(data.error || 'Could not start PayPal checkout');
    }
    return data.paypalOrderId;
  };

  const onApprove = async (data) => {
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Payment could not be completed');
      }
      onSuccess(result.orderId);
    } catch (err) {
      setError(err.message);
    }
  };

  const onErr = (err) => {
    setError(typeof err === 'string' ? err : err?.message || 'PayPal checkout failed. Please try again.');
  };

  if (!clientId || clientId.includes('xxx')) {
    return (
      <div className="p-3 bg-warning/10 text-warning rounded-md text-sm border border-warning/30">
        PayPal is not configured yet.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
        // Guest/card checkout — lets buyers pay with any debit or credit card
        // without a PayPal account. The "Debit or Credit Card" button shows
        // automatically for eligible buyers when the account allows it.
        enableFunding: 'card',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErr}
      />
      <p className="text-xs text-muted mt-3 text-center">
        The &ldquo;Debit or Credit Card&rdquo; button accepts any bank card &mdash; no PayPal account needed.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-danger/10 text-danger rounded-md text-sm border border-danger/30">{error}</div>
      )}
    </PayPalScriptProvider>
  );
}
