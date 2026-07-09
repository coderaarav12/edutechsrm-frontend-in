import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Turbopack (used in dev) - empty config to silence warning
  turbopack: {},
  // Security headers (applied to all routes)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.razorpay.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.razorpay.com; connect-src 'self' https:; frame-src https://*.razorpay.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
          },
        ],
      },
    ]
  },

  // Webpack (used in production builds) - chunk splitting
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        framerMotion: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: "framer-motion",
          priority: 20,
          reuseExistingChunk: true,
        },
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: "recharts",
          priority: 20,
          reuseExistingChunk: true,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: "lucide-icons",
          priority: 15,
          reuseExistingChunk: true,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: "radix-ui",
          priority: 10,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    }
    return config
  },
}

export default nextConfig
