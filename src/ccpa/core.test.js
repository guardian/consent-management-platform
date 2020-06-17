import { init, onIabConsentNotification, _ } from './core';
import { init as initSourcepoint } from './sourcepoint';

let onConsentReady;

jest.mock('./sourcepoint', () => ({
	init: jest.fn((fn) => {
		onConsentReady = fn;
	}),
}));

const mockCcpaTrue = { version: 1, uspString: '1YYN' };

const mockCallback = jest.fn();

// eslint-disable-next-line no-underscore-dangle
window.__uspapi = (command, version, callback) => callback(mockCcpaTrue, true);

describe('Core', () => {
	afterEach(() => {
		_.resetModule();
		mockCallback.mockReset();
	});

	describe('Init', () => {
		beforeEach(() => {
			init();
		});

		it('Initialises Sourcepoint', () => {
			expect(initSourcepoint).toHaveBeenCalledTimes(1);
		});

		it('Obtains the consent state from the CCPA framework', () => {
			expect(_.ccpaState()).toBeTruthy();
		});

		it('Inititalises itself', () => {
			expect(_.isInitialised()).toBeTruthy();
		});
	});

	describe('onConsentNotification', () => {
		it("Does not run the callback if the module hasn't been initialised yet", () => {
			onIabConsentNotification(mockCallback);

			expect(mockCallback).not.toHaveBeenCalled();
		});

		it('Does run the callback if the module has been initialised', () => {
			init();
			onIabConsentNotification(mockCallback);

			expect(mockCallback).toHaveBeenCalledTimes(1);
		});
	});

	describe('Callbacks registered with onConsentNotification', () => {
		it('Are run immediately when a CCPA state change happens', () => {
			init();
			onIabConsentNotification(mockCallback);
			onConsentReady();

			// It should be called once when the callback is registered (tested above)
			// and once more when the state changes (onConsentReady is run)
			expect(mockCallback).toBeCalledTimes(2);
		});

		it('Are passed the correct CCPA state', () => {
			init();
			onIabConsentNotification(mockCallback);

			expect(mockCallback).toHaveBeenCalledWith(true);
		});

		it('Before calling init will be called after calling init', () => {
			onIabConsentNotification(mockCallback);
			init();

			expect(mockCallback).toHaveBeenCalledWith(true);
		});
	});
});
