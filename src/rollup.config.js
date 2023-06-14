import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';

// eslint-disable-next-line import/no-default-export -- This is what rollup expects
export default {
	input: './src/index.ts',
	external: (id) => !/^[./]/.test(id),
	output: [
		{
			file: 'dist/index.js',
			format: 'cjs',
		},
		{
			file: 'dist/index.esm.js',
			format: 'esm',
		},
	],
	plugins: [
		typescript(),
		css(),
		resolve(),
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify('production'),
			__PACKAGE_VERSION__: JSON.stringify(2),
		}),
		commonjs(),
		process.env.NODE_ENV === 'production' &&
			strip({
				include: ['**/*.{j,t}s?(x)'],
				exclude: ['index.*'],
				sourceMap: true,
			}),
	].filter(Boolean),
	watch: {
		clearScreen: false,
	},
};
