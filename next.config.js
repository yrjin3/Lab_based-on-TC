/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://api.dev.letr.ai/labs/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
