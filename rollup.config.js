import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
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
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			__PACKAGE_VERSION__: JSON.stringify(pkg.version),
		}),
		babel({
			extensions,
			babelHelpers: 'runtime',
			presets: [['@babel/preset-env'], '@babel/preset-typescript'],
			plugins: ['@babel/plugin-transform-runtime'],
		}),
		resolve({ extensions }),
		commonjs(),
		strip({
			include: ['**/*.{j,t}s?(x)'],
			sourceMap: true,
		}),
	],
	external: [/@babel\/runtime/],
};
