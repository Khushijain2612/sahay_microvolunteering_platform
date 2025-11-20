import type { NextConfig } from "next/dist/server/config";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-left'
  }
}

export default nextConfig;