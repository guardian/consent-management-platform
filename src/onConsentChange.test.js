/* eslint-disable no-underscore-dangle */
import waitForExpect from 'wait-for-expect';
import USPData from './ccpa/__fixtures__/api.getUSPData.json';
import { invokeCallbacks, onConsentChange } from './onConsentChange';
import CustomVendorConsents from './tcfv2/__fixtures__/api.getCustomVendorConsents.json';
import TCData from './tcfv2/__fixtures__/api.getTCData.json';

beforeEach(() => {
	window.__uspapi = undefined;
	window.__tcfapi = undefined;
});

describe('under CCPA', () => {
	beforeEach(() => {
		window.__uspapi = jest.fn((command, b, callback) => {
			if (command === 'getUSPData') callback(USPData, true);
		});
	});

	it('invokes callbacks correctly', async () => {
		const callback = jest.fn();
		const instantCallback = jest.fn();

		onConsentChange(callback);

		expect(callback).toHaveBeenCalledTimes(0);

		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		onConsentChange(instantCallback);

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
			expect(instantCallback).toHaveBeenCalledTimes(1);
		});
	});

	it('invokes callbacks only if there is a new state', async () => {
		const callback = jest.fn();

		onConsentChange(callback);
		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		USPData.uspString = '1YNN';
		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(2);
		});
	});
});

describe('under TCFv2', () => {
	beforeEach(() => {
		window.__tcfapi = jest.fn((command, b, callback) => {
			if (command === 'getTCData') callback(TCData, true);
			if (command === 'getCustomVendorConsents')
				callback(CustomVendorConsents, true);
		});
	});

	it('invokes callbacks correctly', async () => {
		const callback = jest.fn();
		const instantCallback = jest.fn();

		onConsentChange(callback);

		expect(callback).toHaveBeenCalledTimes(0);

		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		onConsentChange(instantCallback);

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
			expect(instantCallback).toHaveBeenCalledTimes(1);
		});
	});

	it('invokes callbacks only if there is a new state', async () => {
		const callback = jest.fn();

		onConsentChange(callback);
		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		});

		TCData.purpose.consents['1'] = false;
		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(2);
		});
	});
});
