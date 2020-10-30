import ausData from './__fixtures__/api.getCustomVendorRejects.json';
import { getCustomVendorRejects } from './api';
import { getConsentState } from './getConsentState';

jest.mock('./api');
getCustomVendorRejects.mockResolvedValue(ausData);

describe('getConsentState', () => {
	it('gets the consent state correctly', async () => {
		const { ccpaApplies, rejectedVendors } = await getConsentState();

		expect(getCustomVendorRejects).toHaveBeenCalledTimes(1);
		expect(ccpaApplies).toBeTruthy();
		expect(rejectedVendors.length).toBe(0);
	});
});
