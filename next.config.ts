import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "export", // Enable static export
    trailingSlash: true, // Generate /events/index.html instead of /events.html (required for S3)
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
