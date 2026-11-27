import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a plain static website in /out for Netlify.
  output: "export",
  images: {
    // Static export cannot use the Next.js on-demand image optimizer.
    // Keep image URLs local and serve the original optimized assets directly.
    unoptimized: true,
  },
};

export default nextConfig;
