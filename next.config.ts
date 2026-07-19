import type { NextConfig } from "next";

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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseImageHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
