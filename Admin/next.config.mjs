/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/text-to-speech', '@grpc/grpc-js'],
  },
};

export default nextConfig;
