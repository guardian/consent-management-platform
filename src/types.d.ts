declare namespace Cmp {
    type PurposeEvent = 'functional' | 'performance' | 'advertisement';

    type PurposeCallback = (state: boolean | null) => void;

    interface Purpose {
        state: boolean | null;
        callbacks: PurposeCallback[];
    }

    interface GuPurposeState {
        [key: string]: boolean | null;
    }

    interface GuPurposeList {
        purposes: GuPurpose[];
    }

    interface GuPurpose {
        id: number;
        name: string;
        description: string;
        integrations: GuIntegration[];
        hideRadio?: boolean;
    }

    interface GuIntegration {
        name: string;
        policyUrl: string;
    }

    interface IabPurposeState {
        [key: number]: boolean | null;
    }

    interface IabPurpose {
        id: number;
        name: string;
        description: string;
    }

    interface IabFeature {
        id: number;
        name: string;
        description: string;
    }

    interface IabVendor {
        id: number;
        name: string;
        policyUrl: string;
        purposeIds: number[];
        legIntPurposeIds: number[];
        featureIds: number[];
    }

    interface IabVendorList {
        vendorListVersion: number;
        lastUpdated: string;
        purposes: IabPurpose[];
        features: IabFeature[];
        vendors: IabVendor[];
    }
}

export = Cmp;
export as namespace Cmp;
