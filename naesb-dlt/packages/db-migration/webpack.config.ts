const path = require('path');
const ZipPlugin = require('zip-webpack-plugin');
const webpack = require('webpack');
module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'commonjs',
  },
  target: 'node',
  plugins: [
    new ZipPlugin({ filename: 'main.zip' }),
    new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$|^cloudflare:sockets$/ }),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
  ],
};
