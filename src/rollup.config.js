/* eslint-disable import/no-default-export */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';
import pkg from '../package.json';

export default {
	input: './src/index.ts',
	output: [
		{
			file: pkg.main,
			format: 'cjs',
		},
		{
			file: pkg.module,
			format: 'esm',
		},
	],
	plugins: [
		typescript(),
		resolve(),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			__PACKAGE_VERSION__: JSON.stringify(pkg.version),
		}),
		commonjs(),
		strip({
			include: ['**/*.{j,t}s?(x)'],
			exclude: ['index.*'],
			sourceMap: true,
		}),
	],
	watch: {
		clearScreen: false,
	},
};
