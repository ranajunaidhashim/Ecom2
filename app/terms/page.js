export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for WigZ.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm sm:prose-base prose-muted max-w-none">
          <p className="text-muted mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Products and Pricing</h2>
          <p className="mb-4">
            All products are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Accuracy of Billing and Account Information</h2>
          <p className="mb-4">
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Third-Party Links</h2>
          <p className="mb-4">
            Certain content, products and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Contact Information</h2>
          <p className="mb-4">
            Questions about the Terms of Service should be sent to us at support@wigz.store.
          </p>
        </div>
      </div>
    </div>
  );
}
