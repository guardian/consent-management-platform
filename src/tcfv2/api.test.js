/* eslint-disable no-underscore-dangle */

import { getCustomVendorConsents, getTCData } from './api';

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
		'getTCData',
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
