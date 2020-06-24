import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import replace from 'rollup-plugin-replace';

const extensions = ['.ts', '.tsx'];

module.exports = {
	input: ['src/index.ts', 'src/tcf/component/ConsentManagementPlatform.tsx'],
	output: [
		{
			dir: 'dist',
			format: 'cjs',
		},
		{
			dir: 'dist',
			format: 'cjs',
		},
	],
	external: [
		'@babel/runtime/helpers/defineProperty',
		'@babel/runtime/helpers/extends',
		'@emotion/core',
		'@guardian/src-button',
		'@guardian/src-foundations',
		'@guardian/src-foundations/accessibility',
		'@guardian/src-foundations/mq',
		'@guardian/src-foundations/palette',
		'@guardian/src-foundations/themes',
		'@guardian/src-foundations/typography',
		'@guardian/src-svgs',
		'react',
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
