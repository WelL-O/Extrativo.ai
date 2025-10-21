/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Skip trailing slash redirect for API routes and static optimization
  skipTrailingSlashRedirect: true,
  // Disable static page generation errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
