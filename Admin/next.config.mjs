/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/text-to-speech', '@grpc/grpc-js', 'pdfjs-dist'],
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;