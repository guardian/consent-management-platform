import {
    init as initSourcepoint,
    onIabConsentNotification as ccpaOnIabConsentNotification,
    CcpaPurposeCallback,
} from './ccpa/core';
import {
    onIabConsentNotification as tcfOnIabConsentNotification,
    IabPurposeCallback as TcfPurposeCallback,
} from './tcf/core';

type IabPurposeCallback = TcfPurposeCallback | CcpaPurposeCallback;

interface InitOptions {
    useCcpa: boolean;
}

const defaultOptions: InitOptions = {
    useCcpa: false,
};

let ccpa = false;

export const init = (options: InitOptions = defaultOptions) => {
    if (options.useCcpa) {
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
