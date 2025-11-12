/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ensures the build is suitable for platforms like Vercel or Render
  output: 'standalone',

  // optional optimization for dynamic pages
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
