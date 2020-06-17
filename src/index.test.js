import { init, onIabConsentNotification, checkWillShowUi } from './index';
import { onIabConsentNotification as tcfOnIabConsentNotification } from './tcf/core';
import {
	init as initSourcepoint,
	onIabConsentNotification as ccpaOnIabConsentNotification,
} from './ccpa/core';
import { checkWillShowUi as checkWillShowUiCcpa } from './ccpa/sourcepoint';

jest.mock('./tcf/core', () => ({
	onIabConsentNotification: jest.fn(),
}));

jest.mock('./ccpa/core', () => ({
	init: jest.fn(),
	onIabConsentNotification: jest.fn(),
}));

jest.mock('./ccpa/sourcepoint', () => ({
	checkWillShowUi: jest.fn(),
}));

const mockCallback = () => {};

const ccpaOnOptions = { useCcpa: true };

describe('CMP lib', () => {
	it("Calls TCF's onIabConsentNotification when in TCF mode", () => {
		onIabConsentNotification(mockCallback);

		expect(tcfOnIabConsentNotification).toHaveBeenCalledTimes(1);
		expect(tcfOnIabConsentNotification).toHaveBeenCalledWith(mockCallback);
	});

	it('Inititalises CCPA when in CCPA mode', () => {
		init(ccpaOnOptions);

		expect(initSourcepoint).toHaveBeenCalledTimes(1);
	});

	it("Calls CCPA's onIabConsentNotification when in CCPA mode", () => {
		init(ccpaOnOptions);
		onIabConsentNotification(mockCallback);

		expect(ccpaOnIabConsentNotification).toHaveBeenCalledTimes(1);
		expect(ccpaOnIabConsentNotification).toHaveBeenCalledWith(mockCallback);
	});

	it("Calls CCPA's checkWillShowUi when in CCPA mode", () => {
		init(ccpaOnOptions);
		checkWillShowUi();

		expect(checkWillShowUiCcpa).toHaveBeenCalledTimes(1);
	});
});
