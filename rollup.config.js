import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const extensions = ['.ts', '.tsx'];

module.exports = {
    input: 'src/component/ConsentManagementPlatform.tsx',
    output: [
        {
            file: 'lib/ConsentManagementPlatform.js',
            format: 'cjs',
        },
    ],
    external: ['react', '@emotion/core'],
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
};
