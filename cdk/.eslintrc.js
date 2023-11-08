module.exports = {
	root: true,
	env: {
		node: true,
		jest: true,
	},
	parserOptions: {
		ecmaVersion: 2020,
		tsconfigRootDir: __dirname,
		sourceType: 'module',
		project: ['./tsconfig.eslint.json'],
	},
	overrides: [
		{
			files: ['*.js', '*.jsx'],
			extends: ['@guardian/eslint-config'],
		},
		{
			files: ['*.ts', '*.tsx'],
			extends: ['@guardian/eslint-config-typescript'],
		},
	],
	plugins: ['@typescript-eslint'],
	rules: {
		'@typescript-eslint/no-inferrable-types': 0,
		'import/no-namespace': 2,
	},
	ignorePatterns: ['node_modules'],
};
