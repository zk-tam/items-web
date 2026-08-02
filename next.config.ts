import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // File uploads are submitted through Server Actions. Keep this above the
    // 8 MB application-level image limit to account for multipart overhead.
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  images: {
    // Catalog records may reference images hosted on any external origin.
    // Keep SVG optimization disabled: uploads only accept raster image formats.
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" }
    ]
  }
};

export default nextConfig;
