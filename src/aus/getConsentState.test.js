import ausData from './__fixtures__/api.getUSPData.json';
import { getUSPData } from './api';
import { getConsentState } from './getConsentState';

jest.mock('./api');
getUSPData.mockResolvedValue(ausData);

describe('getConsentState', () => {
	it('gets the consent state correctly', async () => {
		const { personalisedAdvertising } = await getConsentState();

		expect(getUSPData).toHaveBeenCalledTimes(1);
		expect(personalisedAdvertising).toBe(true);
	});
});
