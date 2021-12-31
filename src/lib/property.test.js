import { isGuardianDomain } from './domain';
import { getProperty } from './property';

jest.mock('./domain');

const properties = {
	live: 'live.property',
	test: 'test.property',
};

describe('Property', () => {
	it('should use the live property on a guardian domain', () => {
		isGuardianDomain.mockReturnValue(true);

		expect(getProperty(properties)).toEqual(properties.live);
	});

	it('should use the test property otherwise', () => {
		isGuardianDomain.mockReturnValue(false);

		expect(getProperty(properties)).toEqual(properties.test);
	});
});
