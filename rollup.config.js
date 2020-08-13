import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import replace from 'rollup-plugin-replace';
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
	external: [
		'@guardian/old-cmp',
		'@guardian/old-cmp/dist/ConsentManagementPlatform',
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
	],
};
