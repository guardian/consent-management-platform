/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import ausData from './__fixtures__/api.getUSPData.json';
import { getUSPData } from './api.ts';
import { getConsentState } from './getConsentState.ts';

jest.mock('./api');
getUSPData.mockResolvedValue(ausData);

describe('getConsentState', () => {
	it('gets the consent state correctly', async () => {
		const { personalisedAdvertising } = await getConsentState();

		expect(getUSPData).toHaveBeenCalledTimes(1);
		expect(personalisedAdvertising).toBe(true);
	});
});
