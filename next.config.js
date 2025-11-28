/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to avoid React Context issues during build
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig
