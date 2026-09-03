import type { NextConfig } from "next";

import { SITE_DOMAIN } from "./src/lib/site/constants";

function getSupabaseImageHostname(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return "*.supabase.co";
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return "*.supabase.co";
  }
}

const nextConfig: NextConfig = {
  experimental: {
    // Media uploads accept up to 30MB sources. Next.js proxy/middleware
    // buffers request bodies (default 10MB) and silently truncates larger
    // multipart payloads, which breaks FormData parsing / image processing.
    proxyClientMaxBodySize: "35mb",
    serverActions: {
      bodySizeLimit: "35mb",
    },
  },
  // sharp ships a platform-specific native binary as an optional dependency
  // (@img/sharp-linux-x64 etc.) loaded via a runtime require() the bundler's
  // static trace misses. On Vercel that left the serverless functions without
  // the binary, so every route that pulls sharp in (media upload / picker
  // actions, the favicon image route) threw at module load and returned 500 —
  // while `next start` locally worked because the host had sharp installed.
  // Keep sharp external and force its native packages into every server trace.
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@img/**/*", "./node_modules/sharp/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseImageHostname(),
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: SITE_DOMAIN,
        pathname: "/api/media/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/api/favicon",
      },
    ];
  },
};

export default nextConfig;
