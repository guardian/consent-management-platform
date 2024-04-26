/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { getUSPData } from './api.ts';

it('calls the correct IAB api with the correct methods', async () => {
	expect(getUSPData()).rejects.toThrow();

	window.__uspapi = jest.fn((a, b, cb) => {
		cb({}, true);
	});

	await getUSPData();

	expect(window.__uspapi).toHaveBeenCalledWith(
		'getUSPData',
		expect.any(Number),
		expect.any(Function),
	);
});
