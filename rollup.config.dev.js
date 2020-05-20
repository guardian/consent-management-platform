import html from '@rollup/plugin-html';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import path from 'path';

const extensions = ['.js', '.ts'];

const dist = '.dev';

export default {
    input: path.resolve(__dirname, 'dev', 'app.js'),
    output: {
        format: 'esm',
        dir: dist,
        sourcemap: 'inline',
    },
    plugins: [
        typescript({}),
        resolve({ extensions }),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        serve(dist),
        html(),
        livereload({ watch: dist }),
    ],
};
