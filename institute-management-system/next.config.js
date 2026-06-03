/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ CRITICAL: Reduces Docker image from 1GB to 150MB
  output: "standalone",

  // ✅ Build settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ⚡ Performance
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // ⚡ Image optimization
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ✅ Webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.stats = "errors-only";

    if (!dev) {
      config.optimization.minimizer.forEach((plugin) => {
        if (plugin.constructor.name === "TerserPlugin") {
          plugin.options.terserOptions.compress.drop_console = true;
        }
      });
    }

    config.ignoreWarnings = [
      /Module not found/,
      /Can't resolve/,
      /Critical dependency/,
      /the request of a dependency is an expression/,
    ];

    config.bail = false;

    return config;
  },

  // ⚡ Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
