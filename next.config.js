/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 90],
    // Product images are admin-entered URLs from arbitrary suppliers/CDNs,
    // so we can't pin this down to a fixed set of hostnames.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
