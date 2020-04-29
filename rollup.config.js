import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const extensions = ['.ts', '.tsx'];

// eslint-disable-next-line import/no-default-export
export default () => ({
    input: {
        index: 'src/index.ts',
        ConsentManagementPlatform:
            'src/component/ConsentManagementPlatform.tsx',
    },
    output: {
        dir: 'lib',
        format: 'cjs',
    },
    external: [
        'react',
        '@emotion/core',
        '@guardian/src-button',
        '@guardian/src-foundations',
        '@guardian/src-svgs',
        '@guardian/src-foundations/mq',
        '@guardian/src-foundations/typography',
        '@guardian/src-foundations/accessibility',
        '@babel/runtime/helpers/extends',
        '@babel/runtime/helpers/defineProperty',
        '@guardian/src-foundations/palette',
        '@guardian/src-foundations/themes',
    ],
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
});
