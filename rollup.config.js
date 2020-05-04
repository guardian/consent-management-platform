import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const extensions = ['.ts'];

module.exports = {
    input: ['src/index.ts'],
    output: [
        {
            dir: 'lib',
            format: 'cjs',
        },
    ],
    plugins: [babel({ extensions }), resolve({ extensions }), commonjs()],
};
