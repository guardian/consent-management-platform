import strip from '@rollup/plugin-strip';
import babel from 'rollup-plugin-babel';
import bundleSize from 'rollup-plugin-bundle-size';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.ts', '.tsx'];

const input = 'src/index.ts';

const plugins = ({ modules = false } = {}) => [
	babel({
		extensions,
		...(modules && {
			presets: [
				['@babel/preset-env', { targets: { esmodules: true }, bugfixes: true }],
			],
		}),
	}),
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
];

const external = [
	'@guardian/old-cmp',
	'@guardian/old-cmp/dist/ConsentManagementPlatform',
];

module.exports = [
	{
		input,
		output: {
			file: pkg.main,
			format: 'cjs',
		},
		external,
		plugins: plugins(),
	},
	{
		input,
		output: {
			file: pkg.module,
			format: 'esm',
		},
		external,
		plugins: plugins({ modules: true }),
	},
];
