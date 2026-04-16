import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${isProduction ? '' : "'unsafe-eval'"}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
  "frame-src 'self' https://accounts.google.com",
  isProduction ? 'upgrade-insecure-requests' : '',
]
  .filter(Boolean)
  .join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  async headers() {
    const headers = [
      {
        key: 'Content-Security-Policy',
        value: contentSecurityPolicy,
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
    ];

    if (isProduction) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
};

export default nextConfig;
