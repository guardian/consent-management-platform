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
    external: ['react', '@emotion/core'],
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
};
