/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { getUSPData } from './api.ts';

jest.mock('../sourcepoint', () => ({
	sourcepointLibraryLoaded: Promise.resolve(),
}));

it('throws an error on missing window.__uspapi', async () => {
	await expect(getUSPData()).rejects.toThrow('No __uspapi found on window');
});

it('calls the modified IAB api with the correct methods', async () => {
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
