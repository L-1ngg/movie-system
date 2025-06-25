import type { NextConfig } from "next";

const config: NextConfig = {
  // 对后端图片的访问授权
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/static/images/**", // 允许加载这个主机下/static/images/目录里的所有图片
      },
    ],
  },
};

export default config;
