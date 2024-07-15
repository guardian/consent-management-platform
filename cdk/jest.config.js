module.exports = {
	testMatch: ['<rootDir>/lib/**/*.test.ts'],
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
