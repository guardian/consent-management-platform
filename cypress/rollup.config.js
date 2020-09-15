import path from 'path';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import pkg from '../package.json';

const extensions = ['.js', '.ts'];

const dist = 'dist';

export default {
	input: path.resolve(__dirname, 'app.js'),
	output: {
		format: 'esm',
		dir: dist,
		sourcemap: 'inline',
	},
	plugins: [
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
			extensions,
		}),
		resolve({ extensions }),
		commonjs(),
		replace({
			'process.env.NODE_ENV': JSON.stringify('test'),
			__PACKAGE_VERSION__: JSON.stringify(pkg.version),
		}),
		html(),
		serve(dist),
	].filter(Boolean),
	watch: {
		clearScreen: false,
	},
};
