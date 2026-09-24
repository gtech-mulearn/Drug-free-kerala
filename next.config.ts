import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security/csp";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 55: the hero photo (grain and gradient hide the artefacts). 75: everything else.
    qualities: [55, 75],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: [...SECURITY_HEADERS] }];
  },
};

export default nextConfig;
