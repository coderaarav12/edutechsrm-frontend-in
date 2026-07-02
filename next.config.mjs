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
