import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Bạn có thể thêm pathname nếu muốn giới hạn kỹ hơn
        // pathname: '/tên_cloud_của_bạn/**',
      },
    ],
  },
};

export default nextConfig;
