/* eslint-disable no-underscore-dangle */
import waitForExpect from 'wait-for-expect';
import { onConsentChange, invokeCallbacks } from './onConsentChange';

const uspData = {
	version: 1,
	uspString: '1YYN',
};

window.__uspapi = jest.fn((a, b, callback) => {
	callback(uspData, true);
});

// const tcfData = {
// 	purposes: {
// 		consents: {
// 			1: true,
// 			2: false,
// 			3: true,
// 		},
// 	},
// };

describe('onConsentChange', () => {
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

		uspData.uspString = '1YNN';
		invokeCallbacks();

		await waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(2);
		});
	});
});
