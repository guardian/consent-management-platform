import { init, onIabConsentNotification } from './index';
import { init as initSourcepoint } from './ccpa/sourcepoint';
import { onIabConsentNotification as tcfOnIabConsentNotification } from './tcf/core';
import { onIabConsentNotification as ccpaOnIabConsentNotification } from './ccpa/core';

jest.mock('./ccpa/sourcepoint', () => ({
    init: jest.fn(),
}));

jest.mock('./tcf/core', () => ({
    onIabConsentNotification: jest.fn(),
}));

jest.mock('./ccpa/core', () => ({
    onIabConsentNotification: jest.fn(),
}));

const mockCallback = () => {};

describe('CMP lib', () => {
    it("Calls TCF's onIabConsentNotification when in TCF mode", () => {
        onIabConsentNotification(mockCallback);

        expect(tcfOnIabConsentNotification).toHaveBeenCalledTimes(1);
        expect(tcfOnIabConsentNotification).toHaveBeenCalledWith(mockCallback);
    });

    it('Inititalises CCPA when in CCPA mode', () => {
        init(true);

        expect(initSourcepoint).toHaveBeenCalledTimes(1);
    });

    it("Calls CCPA's onIabConsentNotification when in TCF mode", () => {
        init(true);
        onIabConsentNotification(mockCallback);

        expect(ccpaOnIabConsentNotification).toHaveBeenCalledTimes(1);
        expect(ccpaOnIabConsentNotification).toHaveBeenCalledWith(mockCallback);
    });
});
