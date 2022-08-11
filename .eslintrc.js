module.exports = {
	root: true,
	env: {
		jest: true,
		browser: true,
	},
	extends: ['@guardian/eslint-config-typescript'],
	globals: { __PACKAGE_VERSION__: 'readonly' },
	ignorePatterns: ['dist', 'coverage', 'cdk', 'monitoring'],
	rules: {
		// a lot of the 3rd party code uses these
		'no-underscore-dangle': 0,
	},

	overrides: [
		{
			// tests and config files sometimes do unorthodox things, and that's ok
			files: ['**/*.test.*', '*.config.js', '*.ts'],
			rules: {
				'@typescript-eslint/no-unsafe-return': 0,
				'@typescript-eslint/no-unsafe-call': 0,
				'@typescript-eslint/no-floating-promises': 0,
				'@typescript-eslint/no-unsafe-member-access': 0,
				'@typescript-eslint/no-unsafe-assignment': 0,
				'@typescript-eslint/no-var-requires': 0,
				'@typescript-eslint/unbound-method': 0,
			},
		},
	],
};
