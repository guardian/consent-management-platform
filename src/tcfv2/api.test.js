/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { getCustomVendorConsents, getTCData } from './api.ts';

it('calls the correct IAB api with the correct methods', async () => {
	expect(getTCData()).rejects.toThrow();
	expect(getCustomVendorConsents()).rejects.toThrow();

	window.__tcfapi = jest.fn((a, b, cb) => {
		cb({}, true);
	});

	await getTCData();
	await getCustomVendorConsents();

	expect(window.__tcfapi).toHaveBeenNthCalledWith(
		1,
		'addEventListener',
		expect.any(Number),
		expect.any(Function),
	);

	expect(window.__tcfapi).toHaveBeenNthCalledWith(
		2,
		'getCustomVendorConsents',
		expect.any(Number),
		expect.any(Function),
	);
});
