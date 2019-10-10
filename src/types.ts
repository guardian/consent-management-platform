export type CmpMsgData = {
    iabVendorList: VendorList;
    allowedPurposes: number[];
    allowedVendors: number[];
};

export type GuResponsivePurposeEventId = 'functional' | 'performance';

export type GuPurposeEventId = 'essential' | GuResponsivePurposeEventId;

export type ItemState = boolean | null;

export type GuPurposeCallback = (state: ItemState) => void;

export type IabPurposeCallback = (state: IabPurposeState) => void;

export type GuPurposeRegister = {
    [key in GuPurposeEventId]: GuPurposeRegisterItem;
};

export interface IabPurposeRegister {
    state: IabPurposeState;
    callbacks: IabPurposeCallback[];
}

export interface GuPurposeRegisterItem {
    state: ItemState;
    callbacks: GuPurposeCallback[];
}

export interface GuCookie {
    version: number;
    state: GuPurposeState;
}

export interface GuPurposeState {
    [key: string]: ItemState;
}

export interface GuPurposeList {
    purposes: GuPurpose[];
}

export interface GuPurpose {
    id: number;
    name: string;
    eventId: GuPurposeEventId;
    description: string;
    integrations: GuIntegration[];
    alwaysEnabled?: boolean;
}

export interface GuIntegration {
    name: string;
    policyUrl: string;
}

export interface IabPurposeState {
    [key: number]: ItemState;
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
