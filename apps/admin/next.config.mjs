/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ospina/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
