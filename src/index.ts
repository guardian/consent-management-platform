import {
    init as initSourcepoint,
    onIabConsentNotification as ccpaOnIabConsentNotification,
    showPrivacyManager as showCCPAPrivacyManager,
    CcpaPurposeCallback,
    checkWillShowUI as checkWillShowUICcpa,
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

export const showPrivacyManager = () =>
    CCPA_APPLIES
        ? showCCPAPrivacyManager()
        : () => {
              // placeholder for TCFv2 privacy manager
          };

export const checkWillShowUI = () =>
    CCPA_APPLIES ? checkWillShowUICcpa() : Promise.reject(); // placeholder for TCFv2 checkWillShowUI

export { setErrorHandler } from './tcf/error';
export { shouldShow } from './tcf/cmp-ui';
export { onGuConsentNotification } from './tcf/core';
