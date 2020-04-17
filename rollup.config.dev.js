/* eslint-disable import/no-default-export */
import html from '@rollup/plugin-html';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';

const extensions = ['.js', '.ts', '.tsx'];

const scriptTags = (files, publicPath) =>
    files
        .map(
            ({ fileName }) =>
                `<script src="${publicPath}${fileName}" type="module"></script>`,
        )
        .join('');

const template = ({ files, publicPath }) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        ${scriptTags(files.js, publicPath)}
    </head>
    <body>
        <div id="root"></div>
    </body>
    </html>
`;

export default () => ({
    input: 'dev.tsx',
    output: {
        format: 'esm',
        dir: 'lib',
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
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        serve('lib'),
        html({ template }),
    ],
});
