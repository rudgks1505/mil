import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,


  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "your-project.supabase.co", // 배포용 Supabase URL
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "ixaxknlbxrtzznlsxjqv.supabase.co", // 배포용 Supabase URL
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
