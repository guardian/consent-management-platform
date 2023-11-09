module.exports = {
	root: true,
	env: {
		jest: true,
		browser: true,
	},
	globals: { __PACKAGE_VERSION__: 'readonly' },
	ignorePatterns: ['dist', 'coverage', 'cdk', 'monitoring', '*.ts', '*.*.ts'],
	rules: {
		// a lot of the 3rd party code uses these
		'no-underscore-dangle': 0,
	},
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
				'@typescript-eslint/no-floating-promises': 0,
				'@typescript-eslint/no-unsafe-member-access': 0,
				'@typescript-eslint/no-unsafe-assignment': 0,
				'@typescript-eslint/no-var-requires': 0,
				'@typescript-eslint/unbound-method': 0,
				'@typescript-eslint/no-unsafe-argument': 0,
			},
		},
	],
};
