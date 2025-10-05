import path from "path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // moved to top-level in Next 15
  outputFileTracingRoot: path.join(__dirname),

  reactStrictMode: true,
  poweredByHeader: false,
};
export default config;
