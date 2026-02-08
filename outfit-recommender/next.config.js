/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // <-- ignore TypeScript errors during build
  },
};

module.exports = nextConfig;
