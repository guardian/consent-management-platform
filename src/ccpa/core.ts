import { init as initSourcepoint } from './sourcepoint';

export type CcpaPurposeCallback = (state: boolean) => void;

const ccpaCallbackList: CcpaPurposeCallback[] = [];

let initialised = false;
let ccpaState = false;

export const init = () => {
    initSourcepoint(runCallbacksOnCcpaReady);
    updateCcpaStateAnd(() => {
        initialised = true;
    });
};

export const onIabConsentNotification = (
    callback: CcpaPurposeCallback,
): void => {
    if (initialised) {
        callback(ccpaState);
    }
    ccpaCallbackList.push(callback);
};

const runCallbacksOnCcpaReady = () => {
    updateCcpaStateAnd(runCallbacks);
};

const runCallbacks = () => {
    ccpaCallbackList.forEach(cb => cb(ccpaState));
};

const updateCcpaStateAnd = (doThis: () => void) => {
    // eslint-disable-next-line no-underscore-dangle
    window.__uspapi('getUSPData', 1, (uspData, success) => {
        if (success && uspData?.uspString?.charAt(2) === 'Y') {
            ccpaState = true;
        } else {
            ccpaState = false;
        }

        doThis();
    });
};

export const _ = {
    isInitialised: () => initialised,
    ccpaState: () => ccpaState,
    resetModule: () => {
        initialised = false;
        ccpaState = false;
        ccpaCallbackList.length = 0;
    },
};
