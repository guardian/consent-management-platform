import type { ConsentState, OnConsentChange } from './types';
export declare const invokeCallbacks: () => void;
export declare const onConsentChange: OnConsentChange;
export declare const _: {
    getConsentState: () => Promise<ConsentState>;
};
