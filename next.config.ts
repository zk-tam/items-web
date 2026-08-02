import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Item media uploads go directly to storage. This only needs to cover the
    // single artist profile-image upload (8 MB) plus multipart overhead.
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
