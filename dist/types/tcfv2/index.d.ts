export declare type TCFv2ConsentList = Record<string, boolean>;
export interface TCFv2ConsentState {
    consents: TCFv2ConsentList;
    eventStatus: TCEventStatusCode;
    vendorConsents: TCFv2ConsentList;
    addtlConsent: string;
    gdprApplies: boolean | undefined;
    tcString: string;
}
export declare type ConsentVector = Record<string, boolean>;
export declare type TCEventStatusCode = 'tcloaded' | 'cmpuishown' | 'useractioncomplete';
export declare type TCPingStatusCode = 'stub' | 'loading' | 'loaded' | 'error' | 'visible' | 'hidden' | 'disabled';
