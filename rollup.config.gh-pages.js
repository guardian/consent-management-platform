/* eslint-disable import/no-default-export */
import html from '@rollup/plugin-html';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import path from 'path';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.ts', '.tsx'];

const dist = '.gh-pages';

export default {
    input: path.resolve(__dirname, 'dev', 'app.tsx'),
    output: {
        format: 'esm',
        dir: dist,
        sourcemap: true,
    },
    plugins: [
        babel({ extensions }),
        resolve({ extensions }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        commonjs({
            namedExports: {
                react: [
                    'createContext',
                    'forwardRef',
                    'createElement',
                    'Component',
                    'Fragment',
                ],
            },
        }),
        terser(),
        html({
            title: 'CMP Sourcepoint progress',
        }),
    ],
};
