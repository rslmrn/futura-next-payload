import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["www.futura-next-payload.vercel.app", "utfs.io"],
  },
};

export default withPayload(nextConfig);
