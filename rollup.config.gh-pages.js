import html from '@rollup/plugin-html';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import path from 'path';

const extensions = ['.js', '.ts'];

const dist = '.gh-pages';

export default {
    input: path.resolve(__dirname, 'dev', 'app.js'),
    output: {
        format: 'esm',
        dir: dist,
        sourcemap: true,
    },
    plugins: [
        babel({ extensions }),
        resolve({ extensions }),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        html(),
    ],
};
