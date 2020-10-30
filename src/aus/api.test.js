import { getCustomVendorRejects } from './api';

it('throws an error on missing window.__uspapi', async () => {
	await expect(getCustomVendorRejects()).rejects.toThrow(
		'No __uspapi found on window',
	);
});

it('calls the modified IAB api with the correct methods', async () => {
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
