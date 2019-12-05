module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
        '@babel/preset-react',
        ['@emotion/babel-preset-css-prop', { sourceMap: false }],
    ],
    plugins: ['@babel/plugin-proposal-class-properties'],
};
