/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix lockfile warning
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
