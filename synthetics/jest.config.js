module.exports = {
	testMatch: ["<rootDir>/cdk/lib/**/*.test.ts"],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	setupFilesAfterEnv: ["./jest.setup.js"],
};
