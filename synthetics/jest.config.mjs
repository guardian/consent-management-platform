export default {
	testMatch: ["<rootDir>/src/**/*.test.js"],
	transform: {},
	testEnvironment: "node",
	moduleNameMapper: {
		"^@amzn/synthetics-playwright$":
			"<rootDir>/src/__mocks__/synthetics-playwright.js",
	},
};
