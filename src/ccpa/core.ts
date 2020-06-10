import { init as initSourcepoint, MsgData } from './sourcepoint';

export type CcpaPurposeCallback = (state: boolean) => void;
type PromiseResolve = (result: boolean) => void;

const ccpaCallbackList: CcpaPurposeCallback[] = [];

let initialised = false;
let ccpaState = false;
let willShowUIPromise: Promise<boolean> | null = null;
let willShowUIResolve: PromiseResolve | null = null;

export const init = () => {
    willShowUIPromise = new Promise<boolean>(resolve => {
        willShowUIResolve = resolve;
    });
    initSourcepoint(runCallbacksOnCcpaReady, runOnMessageReceiveData);
    updateCcpaState();
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
    updateCcpaState();
};

const runOnMessageReceiveData = (data: MsgData): void => {
    willShowUIResolve?.(data.msg_id !== 0);
};

const updateCcpaState = () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__uspapi('getUSPData', 1, (uspData, success) => {
        // The __uspapi request is asynchorous before it's
        // framework is inititalised and synchorous after.
        // Therefore we need to guarantee inititalised = true
        // only after first receiving the state.
        initialised = true;

        if (success && uspData?.uspString?.charAt(2) === 'Y') {
            ccpaState = true;
        } else {
            ccpaState = false;
        }

        ccpaCallbackList.forEach(cb => cb(ccpaState));
    });
};

export const checkWillShowUI = (): Promise<boolean> => {
    return willShowUIPromise ?? Promise.reject();
};

export const showPrivacyManager = () =>
    // eslint-disable-next-line no-underscore-dangle
    window._sp_ccpa?.loadPrivacyManagerModal?.(
        null,
        '5ed10d99c3b12e4c1052efca',
    );

export const _ = {
    isInitialised: () => initialised,
    ccpaState: () => ccpaState,
    resetModule: () => {
        initialised = false;
        ccpaState = false;
        ccpaCallbackList.length = 0;
    },
};
