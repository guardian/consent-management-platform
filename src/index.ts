import { init as initSourcepoint } from './ccpa/sourcepoint';
import {
    onIabConsentNotification as tcfOnIabConsentNotification,
    IabPurposeCallback as TcfPurposeCallback,
} from './tcf/core';
import {
    onIabConsentNotification as ccpaOnIabConsentNotification,
    CcpaPurposeCallback,
} from './ccpa/core';

type IabPurposeCallback = TcfPurposeCallback | CcpaPurposeCallback;

let ccpa = false;

export const init = (useCcpa = false) => {
    if (useCcpa) {
        initSourcepoint();
        ccpa = true;
    }
};

export const onIabConsentNotification = (callback: IabPurposeCallback) =>
    ccpa
        ? ccpaOnIabConsentNotification(callback as CcpaPurposeCallback)
        : tcfOnIabConsentNotification(callback as TcfPurposeCallback);

export { setErrorHandler } from './tcf/error';
export { shouldShow } from './tcf/cmp-ui';
export { onGuConsentNotification } from './tcf/core';
