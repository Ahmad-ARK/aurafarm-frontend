import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'export' only applies during `npm run build` for Capacitor/static output
  // Dev server works normally without this flag
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
