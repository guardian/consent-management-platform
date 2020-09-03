import strip from '@rollup/plugin-strip';
import babel from 'rollup-plugin-babel';
import bundleSize from 'rollup-plugin-bundle-size';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.ts', '.tsx'];

module.exports = {
	input: 'src/index.ts',
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
		babel({ extensions }),
		resolve({ extensions }),
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		commonjs(),
		strip({
			include: ['**/*.{j,t}s?(x)'],
			sourceMap: true,
		}),
		terser({ safari10: true }),
		bundleSize(),
	],
};
