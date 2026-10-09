import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem isso o Next bloqueia /_next/* quando o celular acessa o dev server
  // pelo IP da rede local, o React não hidrata e os onClick não respondem.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  async rewrites() {
    return [
      {
        source: "/bcl-api/:path*",
        destination: "http://127.0.0.1:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
