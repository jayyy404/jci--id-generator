import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root — a stray lockfile in the user's home directory
  // otherwise makes Next.js infer the wrong root and mis-resolve `@/*` paths.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
