// File: next.config.ts
// Path: /next.config.ts
// Description: Next.js configuration with support for all external image sources

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ============================================
      // IMGUR
      // ============================================
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // UNSPLASH (Primary image source)
      // ============================================
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // OTHER STOCK PHOTO SOURCES
      // ============================================
      // Pexels
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pexels.com',
        port: '',
        pathname: '/**',
      },
      // Freepik
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      // Pixabay
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      // Getty Images
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
        port: '',
        pathname: '/**',
      },
      // Shutterstock
      {
        protocol: 'https',
        hostname: 'image.shutterstock.com',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // CDN & CLOUD SERVICES
      // ============================================
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // AWS CloudFront
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      // AWS S3
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Google Cloud Storage
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // E-COMMERCE & SHOPPING
      // ============================================
      // Shopify
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.shopify.com',
        port: '',
        pathname: '/**',
      },
      // WooCommerce
      {
        protocol: 'https',
        hostname: '**.woocommerce.com',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // YOUR OWN DOMAIN (Production)
      // ============================================
      {
        protocol: 'https',
        hostname: 'mercadonacer.ma',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mercadonacer.ma',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mercadonacer.ma',
        port: '',
        pathname: '/**',
      },

      // ============================================
      // LOCAL DEVELOPMENT
      // ============================================
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },

      // ============================================
      // ANY OTHER HTTPS DOMAIN (Wildcard - Use Carefully)
      // ============================================
      // Uncomment this ONLY if you need to allow any domain
      // {
      //   protocol: 'https',
      //   hostname: '**',
      //   port: '',
      //   pathname: '/**',
      // },
    ],

    // Image optimization settings
    minimumCacheTTL: 60, // Cache images for 60 seconds minimum
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'], // Modern formats for better performance

    // Optional: Disable static image import warning
    // dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Enable SWC minification for faster builds
  //swcMinify: true,

  // Compress responses
  compress: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Production source maps (disable for better performance)
  productionBrowserSourceMaps: false,

  // Transpile packages if needed
  transpilePackages: ['lucide-react'],

};

export default nextConfig;