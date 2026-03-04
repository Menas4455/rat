/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
   async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: 'https://menas455.app.n8n.cloud/:path*',
      },
    ];
  },
}

module.exports = nextConfig
