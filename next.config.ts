import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [ '*' ],
      // 强制使用 Node.js 运行时
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
