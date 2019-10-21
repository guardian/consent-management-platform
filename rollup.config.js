import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const extensions = ['.ts', '.tsx'];

module.exports = {
    input: 'src/component/Cmp-Ui-Component.tsx',
    output: [
        {
            file: 'lib/Cmp-Ui-Component.js',
            format: 'cjs',
        },
    ],
    external: ['react', '@emotion/core', '@emotion/css'],
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
};
