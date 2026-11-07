import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Short addresses that emails or old links may use. Query strings (e.g. ?token=...) are kept.
  async redirects() {
    return [
      { source: "/login", destination: "/RegisterPage/Login", permanent: false },
      { source: "/verify-email", destination: "/RegisterPage/verify-email", permanent: false },
      { source: "/check-email", destination: "/RegisterPage/check-email", permanent: false },
      { source: "/forgot-password", destination: "/RegisterPage/Forgot-password", permanent: false },
    ];
  },
};

export default nextConfig;
