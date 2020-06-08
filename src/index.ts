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

let CCPA_APPLIES = false;

export const init = (options: InitOptions = defaultOptions) => {
    if (options.useCcpa) {
        initSourcepoint();
        CCPA_APPLIES = true;
    }
};

// race condition - called before init so ccpa is false
export const onIabConsentNotification = (callback: IabPurposeCallback) =>
    CCPA_APPLIES
        ? ccpaOnIabConsentNotification(callback as CcpaPurposeCallback)
        : tcfOnIabConsentNotification(callback as TcfPurposeCallback);

export { setErrorHandler } from './tcf/error';
export { shouldShow } from './tcf/cmp-ui';
export { onGuConsentNotification } from './tcf/core';
