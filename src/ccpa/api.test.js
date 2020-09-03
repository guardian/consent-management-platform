/* eslint-disable no-underscore-dangle */

import { getUSPData } from './api';

it('calls the correct IAB api with the correct methods', async () => {
	expect(getUSPData()).rejects.toThrow();

	window.__uspapi = jest.fn((a, b, cb) => {
		cb({}, true);
	});

	await getUSPData();

	expect(window.__uspapi).toHaveBeenNthCalledWith(
		1,
		'getUSPData',
		expect.any(Number),
		expect.any(Function),
	);
});
