module.exports = {
	root: true,
	env: {
		jest: true,
		browser: true,
	},
	ignorePatterns: [
		'dist',
		'coverage',
		'cdk',
		'monitoring',
		'cypress.config.ts',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 6,
		project: 'tsconfig.json',
		sourceType: 'module',
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
		{
			files: ['**/*.test.*'],
			rules: {
				'@typescript-eslint/no-unsafe-return': 0,
				'@typescript-eslint/no-unsafe-call': 0,
				'@typescript-eslint/unbound-method': 0,
				'@typescript-eslint/no-unnecessary-condition': 0,
			},
		},
	],
};
