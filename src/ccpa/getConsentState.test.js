/* eslint-disable no-underscore-dangle */
import USPData from './__fixtures__/api.getUSPData.json';
import { getUSPData } from './api';
import { getConsentState } from './getConsentState';

jest.mock('./api');
getUSPData.mockReturnValue(Promise.resolve(USPData));

describe('getConsentState', () => {
	it('invokes callbacks correctly', async () => {
		const { doNotSell } = await getConsentState();
		expect(getUSPData).toHaveBeenCalledTimes(1);
		expect(doNotSell).toBe(true);
	});
});
