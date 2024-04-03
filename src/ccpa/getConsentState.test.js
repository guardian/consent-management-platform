/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import uspData from './__fixtures__/api.getUSPData.json';
import { getUSPData } from './api.ts';
import { getConsentState } from './getConsentState.ts';

jest.mock('./api');
getUSPData.mockResolvedValue(uspData);

describe('getConsentState', () => {
	it('gets the consent state correctly', async () => {
		const { doNotSell } = await getConsentState();

		expect(getUSPData).toHaveBeenCalledTimes(1);
		expect(doNotSell).toBe(true);
	});
});
