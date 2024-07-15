module.exports = {
	testMatch: ['<rootDir>/src/**/*.test.ts'],
	"transform": {
		"\\.[jt]sx?$": [
			"ts-jest",
			{
				"useESM": false
			}
		]
    },
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	  },
	setupFilesAfterEnv: ['./jest.setup.js'],
};
