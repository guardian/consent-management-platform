export default {
	testMatch: ['<rootDir>/src/**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	setupFilesAfterEnv: ['./jest.setup.js'],
};
