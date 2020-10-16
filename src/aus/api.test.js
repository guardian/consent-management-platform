/* eslint-disable no-underscore-dangle */

import { getCustomVendorRejects } from './api';

it('calls the modified IAB api with the correct methods', async () => {
	expect(getCustomVendorRejects()).rejects.toThrow();

	window.__uspapi = jest.fn((a, b, cb) => {
		cb({}, true);
	});

	await getCustomVendorRejects();

	expect(window.__uspapi).toHaveBeenCalledWith(
		'getCustomVendorRejects',
		expect.any(Number),
		expect.any(Function),
	);
});
