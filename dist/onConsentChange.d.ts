import type { Callback, ConsentState } from './types';
export declare const invokeCallbacks: () => void;
export declare const onConsentChange: (fn: Callback) => void;
export declare const _: {
    getConsentState: () => Promise<ConsentState>;
};
