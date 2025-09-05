/* eslint-disable import/no-extraneous-dependencies */
import typescript from 'rollup-plugin-typescript2';
import scss from 'rollup-plugin-postcss';
import svgr from '@svgr/rollup';
import image from '@rollup/plugin-image';
import pkg from './package.json';

const input = 'src/index.ts';
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  scss({
    extensions: ['.scss', '.css'],
  }),
  svgr(),
  image(),
  typescript({
    typescript: require('typescript'),
  }),
];

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
    external,
  },
];
