/* eslint-disable @typescript-eslint/no-var-requires */
const CracoAlias = require('craco-alias');
const webpack = require('webpack');
module.exports = {
  typescript: {
    enableTypeChecking: false /* (default value)  */,
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          url: require.resolve('url'),
          fs: require.resolve('fs'),
          assert: require.resolve('assert'),
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
          buffer: require.resolve('buffer'),
          stream: require.resolve('stream-browserify'),
        },
      },
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        url: require.resolve('url'),
        fs: require.resolve('fs'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        'process/browser': require.resolve('process/browser')
      };
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      );
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: './src',
        tsConfigPath: './tsconfig.build.json',
      },
    },
  ],
};
