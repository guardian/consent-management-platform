import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

const dist = 'test-page/dist';

export default {
	input: './test-page/index.js',
	output: {
		format: 'esm',
		dir: dist,
		sourcemap: process.env.ROLLUP_WATCH ? 'inline' : true,
	},
	plugins: [
		svelte(),
		css(),
		babel({
			babelHelpers: 'bundled',
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							esmodules: true,
						},
					},
				],
			],
		}),
		resolve(),
		commonjs(),
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify('development'),
			__PACKAGE_VERSION__: JSON.stringify(pkg.version),
		}),
		!process.env.ROLLUP_WATCH && terser(),
		html({ title: 'Guardian CMP' }),
		process.env.ROLLUP_WATCH && serve(dist),
		process.env.ROLLUP_WATCH && livereload({ watch: dist }),
	].filter(Boolean),
	watch: {
		clearScreen: false,
	},
};
