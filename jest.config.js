/* eslint-disable @typescript-eslint/no-var-requires */
// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const pkg = require('./package.json');

module.exports = {
	globals: { __PACKAGE_VERSION__: pkg.version },
	clearMocks: true,
	testPathIgnorePatterns: ['cypress'],
	transformIgnorePatterns: ['/node_modules/(?!@guardian/).+\\.js$'],
};
