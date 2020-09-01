import path from 'path';
import html from '@rollup/plugin-html';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.ts'];

const dist = process.env.ROLLUP_WATCH ? '.dev' : '.gh-pages';

// eslint-disable-next-line import/no-default-export
export default {
	input: path.resolve(__dirname, 'dev', 'app.ts'),
	output: {
		format: 'esm',
		dir: dist,
		sourcemap: process.env.ROLLUP_WATCH ? 'inline' : true,
	},
	plugins: [
		babel({ extensions }),
		resolve({ extensions }),
		commonjs({
			namedExports: {
				react: [
					'createContext',
					'forwardRef',
					'createElement',
					'Component',
					'Fragment',
				],
			},
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
		html(),
		...(process.env.ROLLUP_WATCH
			? [serve(dist), livereload({ watch: dist })]
			: [terser({ safari10: true })]),
	],
};
