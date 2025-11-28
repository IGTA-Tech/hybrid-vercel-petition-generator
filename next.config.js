// Load polyfills before Next.js build
require('./file-polyfill.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Skip static optimization for error pages
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig
