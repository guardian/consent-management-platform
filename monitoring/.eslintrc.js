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
	extends: ['@guardian/eslint-config-typescript'],
	rules: {
		'@typescript-eslint/no-inferrable-types': 0,
		'import/no-namespace': 2,
	},
	ignorePatterns: ['node_modules', 'dist'],
};
