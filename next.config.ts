import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Standard build output — works with `next start`, Vercel, Netlify and
     any Node.js host. `output: "standalone"` can be re-enabled for Docker
     / minimal-container deployments. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
