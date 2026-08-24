import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "app.creatabl-ia.com"
  ],
  async redirects() {
    return [
      {
        source: '/tarifs',
        destination: 'https://www.creatabl-ia.com/pricing',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;