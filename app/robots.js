export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vellouracollective.shop';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
