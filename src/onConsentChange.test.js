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

describe('onConsentChange', () => {
	it('invokes callbacks correctly', () => {
		const callback = jest.fn();
		const instantCallback = jest.fn();
		onConsentChange(callback);
		expect(callback).toHaveBeenCalledTimes(0);
		invokeCallbacks();
		return waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		}).then(() => {
			onConsentChange(instantCallback);
			return waitForExpect(() => {
				expect(callback).toHaveBeenCalledTimes(1);
				expect(instantCallback).toHaveBeenCalledTimes(1);
			});
		});
	});

	it('invokes callbacks only if there is a new state', () => {
		const callback = jest.fn();
		onConsentChange(callback);
		invokeCallbacks();
		return waitForExpect(() => {
			expect(callback).toHaveBeenCalledTimes(1);
		})
			.then(invokeCallbacks)
			.then(() => {
				return waitForExpect(() => {
					expect(callback).toHaveBeenCalledTimes(1);
				});
			})
			.then(() => {
				uspData.uspString = '1YNN';
			})
			.then(invokeCallbacks)
			.then(() =>
				waitForExpect(() => {
					expect(callback).toHaveBeenCalledTimes(2);
				}),
			);
	});
});
