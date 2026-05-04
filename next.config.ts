import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "app.creatabl-ia.com"
  ],
};

export default nextConfig;