export const metadata = {
  title: 'Shipping Information',
  description: 'Shipping Information for WigZ.',
};

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-background py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8">Shipping Information</h1>
        
        <div className="prose prose-sm sm:prose-base prose-muted max-w-none">
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Order Processing Time</h2>
          <p className="mb-4">
            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Shipping Rates & Delivery Estimates</h2>
          <p className="mb-4">
            Shipping charges for your order will be calculated and displayed at checkout.
          </p>
          <ul className="list-disc pl-5 mb-4 text-muted space-y-2">
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping:</strong> 1-2 business days</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Shipment Confirmation & Order Tracking</h2>
          <p className="mb-4">
            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours. You can also use our Track Order page to check the real-time status of your delivery.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Customs, Duties and Taxes</h2>
          <p className="mb-4">
            WigZ is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Damages</h2>
          <p className="mb-4">
            If you received your order damaged, please contact us immediately so we can file a claim and arrange for a replacement. Please save all packaging materials and damaged goods before filing a claim.
          </p>
        </div>
      </div>
    </div>
  );
}
