import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "export", // Enable static export
    images: {
        unoptimized: true, // Required for static export
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "tixly.s3.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "*.s3.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "*.s3.*.amazonaws.com",
            },
        ],
    },
}

export default nextConfig
