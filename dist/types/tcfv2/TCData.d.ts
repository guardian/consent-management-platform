import type { TCEventStatusCode, TCFv2ConsentList, TCPingStatusCode } from '.';
export interface TCData {
    tcString: string;
    tcfPolicyVersion: number;
    cmpId: number;
    cmpVersion: number;
    addtlConsent: string;
    gdprApplies?: boolean;
    eventStatus: TCEventStatusCode;
    cmpStatus: TCPingStatusCode;
    listenerId?: number;
    isServiceSpecific: boolean;
    useNonStandardStacks: boolean;
    publisherCC: string;
    purposeOneTreatment: boolean;
    outOfBand: {
        allowedVendors: TCFv2ConsentList;
        disclosedVendors: TCFv2ConsentList;
    };
    purpose: {
        consents: TCFv2ConsentList;
        legitimateInterests: TCFv2ConsentList;
    };
    vendor: {
        consents: TCFv2ConsentList;
        legitimateInterests: TCFv2ConsentList;
    };
    specialFeatureOptins: TCFv2ConsentList;
    publisher: {
        consents: TCFv2ConsentList;
        legitimateInterests: TCFv2ConsentList;
        customPurpose: {
            consents: TCFv2ConsentList;
            legitimateInterests: TCFv2ConsentList;
        };
        restrictions: Record<string, Record<string, 0 | 1 | 2>>;
    };
}
