import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App Router is on by default in Next.js 13+
  // Suppress the Pages Router warning we don't need
  reactStrictMode: true,
};

export default nextConfig;
