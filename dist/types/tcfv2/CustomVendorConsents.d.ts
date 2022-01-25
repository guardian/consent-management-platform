export interface CustomVendorConsents {
    consentedPurposes: {
        _id: string;
        name: string;
    };
    consentedVendors: {
        _id: string;
        name: string;
        vendorType: string;
    };
    grants: Record<string, {
        purposeGrants: Record<string, boolean>;
        vendorGrant: boolean;
    }>;
    legIntPurposes: {
        _id: string;
        name: string;
    };
}
