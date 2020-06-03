import html from '@rollup/plugin-html';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import path from 'path';

const extensions = ['.js', '.ts', '.tsx'];

const dist = '.dev';

// eslint-disable-next-line import/no-default-export
export default {
    input: path.resolve(__dirname, 'app.tsx'),
    output: {
        format: 'esm',
        dir: dist,
        sourcemap: 'inline',
    },
    plugins: [
        babel({ extensions }),
        resolve({ extensions }),
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
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        serve(dist),
        html(),
        livereload({ watch: dist }),
    ],
};
