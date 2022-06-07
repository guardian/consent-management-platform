import type { VendorName } from '../vendors';
import type { AUSConsentState } from './aus';
import type { CCPAConsentState } from './ccpa';
import type { Country } from './countries';
import type { TCFv2ConsentState } from './tcfv2';
export declare type Framework = 'tcfv2' | 'ccpa' | 'aus';
export declare type CMP = {
    init: InitCMP;
    willShowPrivacyMessage: WillShowPrivacyMessage;
    willShowPrivacyMessageSync: () => boolean;
    hasInitialised: () => boolean;
    showPrivacyManager: () => void;
    version: string;
    __isDisabled: () => boolean;
    __disable: () => void;
    __enable: () => void;
};
export declare type InitCMP = (arg0: {
    pubData?: PubData;
    country?: Country;
}) => void;
export declare type OnConsentChange = (fn: Callback) => void;
export declare type GetConsentFor = (vendor: VendorName, consent: ConsentState) => boolean;
export interface ConsentState {
    tcfv2?: TCFv2ConsentState;
    ccpa?: CCPAConsentState;
    aus?: AUSConsentState;
    gpcSignal?: boolean;
    canTarget: boolean;
    framework: Framework | null;
}
export interface PubData {
    browserId?: string;
    pageViewId?: string;
    [propName: string]: unknown;
}
export interface SourcepointImplementation {
    init: (framework: Framework, pubData?: PubData) => void;
    willShowPrivacyMessage: WillShowPrivacyMessage;
    showPrivacyManager: () => void;
}
export declare type WillShowPrivacyMessage = () => Promise<boolean>;
export declare type Callback = (arg0: ConsentState) => void;
export declare type CallbackQueueItem = {
    fn: Callback;
    lastState?: string;
};
export interface VendorConsents {
    grants: Record<string, {
        purposeGrants: Record<number, boolean>;
        vendorGrant: boolean;
    }>;
}
export type { VendorName };
