// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    //output: 'standalone',
    //outputStandalone: true,
    outputFileTracingRoot: path.join(__dirname, '../..'),
  },
};

module.exports = nextConfig;
