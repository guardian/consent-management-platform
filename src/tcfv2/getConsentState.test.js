/* eslint-disable no-underscore-dangle */
import CustomVendorConsents from './__fixtures__/api.getCustomVendorConsents.json';
import TCData from './__fixtures__/api.getTCData.json';
import { getCustomVendorConsents, getTCData } from './api';
import { getConsentState } from './getConsentState';

jest.mock('./api');
getTCData.mockReturnValue(Promise.resolve(TCData));
getCustomVendorConsents.mockReturnValue(Promise.resolve(CustomVendorConsents));

describe('getConsentState', () => {
	it('gets the consent state correctly', async () => {
		const { consents, eventStatus, vendorConsents } = await getConsentState();

		expect(getTCData).toHaveBeenCalledTimes(1);
		expect(getCustomVendorConsents).toHaveBeenCalledTimes(1);

		expect(consents).toStrictEqual({
			1: true,
			2: true,
			3: true,
			4: true,
			5: true,
			6: true,
			7: true,
			8: true,
			9: true,
			10: true,
		});
		expect(eventStatus).toBe('tcloaded');
		expect(vendorConsents).toMatchSnapshot();
	});
});
