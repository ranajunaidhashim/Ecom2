export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for WigZ.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm sm:prose-base prose-muted max-w-none">
          <p className="text-muted mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, postal address, phone number, and payment information.
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending technical notices and support messages, and communicating with you about products, services, and offers.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All payment transactions are encrypted using SSL technology and processed through secure payment gateways.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at support@wigz.store.
          </p>
        </div>
      </div>
    </div>
  );
}
