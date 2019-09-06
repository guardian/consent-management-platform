export type PurposeEvent = 'functional' | 'performance' | 'advertisement';

export type PurposeCallback = (state: boolean | null) => void;

export interface Purpose {
    state: boolean | null;
    callbacks: PurposeCallback[];
}

export interface GuPurposeState {
    [key: string]: boolean | null;
}

export interface GuPurposeList {
    purposes: GuPurpose[];
}

export interface GuPurpose {
    id: number;
    name: string;
    description: string;
    integrations: GuIntegration[];
    hideRadio?: boolean;
}

export interface GuIntegration {
    name: string;
    policyUrl: string;
}

export interface IabPurposeState {
    [key: number]: boolean | null;
}

export interface IabPurpose {
    id: number;
    name: string;
    description: string;
}

export interface IabFeature {
    id: number;
    name: string;
    description: string;
}

export interface IabVendor {
    id: number;
    name: string;
    policyUrl: string;
    purposeIds: number[];
    legIntPurposeIds: number[];
    featureIds: number[];
}

export interface IabVendorList {
    vendorListVersion: number;
    lastUpdated: string;
    purposes: IabPurpose[];
    features: IabFeature[];
    vendors: IabVendor[];
}
