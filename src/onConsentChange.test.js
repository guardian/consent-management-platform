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
const tcfData = {
	purposes: {
		consents: {
			1: true,
			2: false,
			3: true,
		},
	},
};

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

	it('returns all 10 TCF purposes even if they are false', () => {
		const consents = {
			'1': false,
			'2': false,
			'3': false,
			'4': false,
			'5': false,
			'6': false,
			'7': false,
			'8': false,
			'9': false,
			'10': false,
			...tcfData.purposes.consents,
		};

		expect(Object.keys(consents)).toHaveLength(10);
	});
});
