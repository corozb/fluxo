/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables source maps in production for easier debugging
  productionBrowserSourceMaps: false,
  // React Strict Mode is on by default in Next.js, but good to be explicit
  reactStrictMode: true,
  // Using the App Router
  experimental: {
    // Add any experimental features if needed
  },
  // If you need to allow images from external domains
  images: {
    domains: [], 
  },
};

export default nextConfig;
