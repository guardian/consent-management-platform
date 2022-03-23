import type { CMP, GetConsentFor, OnConsentChange } from './types';
export declare const isServerSide: boolean;
export declare const serverSideWarn: () => void;
export declare const serverSideWarnAndReturn: <T extends unknown>(arg: T) => () => T;
export declare const cmp: CMP;
export declare const onConsentChange: OnConsentChange;
export declare const getConsentFor: GetConsentFor;
