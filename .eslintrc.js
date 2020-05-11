module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['jest', 'prettier'],
    extends: ['prettier/@typescript-eslint'],
    env: {
        'jest/globals': true,
        browser: true,
    },
    rules: {
        'prettier/prettier': 2,
    },
    overrides: [
        {
            files: ['*.js'],
            parser: 'espree',
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2017,
            },
        },
    ],
};
