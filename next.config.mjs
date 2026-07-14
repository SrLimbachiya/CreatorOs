/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Ensure we don't try to use server features
  trailingSlash: true,
};

export default nextConfig;
