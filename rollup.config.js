import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const extensions = ['.ts', '.tsx'];

module.exports = {
    input: ['src/index.ts', 'src/component/ConsentManagementPlatform.tsx'],
    output: [
        {
            dir: 'lib',
            format: 'cjs',
        },
        {
            dir: 'lib',
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
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
};
