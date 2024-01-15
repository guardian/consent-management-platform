declare global {
    interface Window {
        _sp_: {
            version: string;
        };
    }
}
export type JurisdictionOpt = string | undefined;
export type AwsRegionOpt = string | undefined;
export declare enum JURISDICTIONS {
    TCFV2 = "tcfv2",
    CCPA = "ccpa",
    AUS = "aus"
}
export declare enum STAGES {
    PROD = "prod",
    CODE = "code",
    LOCAL = "local"
}
export declare const ELEMENT_ID: {
    TCFV2_FIRST_LAYER_ACCEPT_ALL: string;
    TCFV2_FIRST_LAYER_MANAGE_COOKIES: string;
    TOP_ADVERT: string;
    CMP_CONTAINER: string;
    TCFV2_SECOND_LAYER_SAVE_AND_EXIT: string;
    TCFV2_SECOND_LAYER_HEADLINE: string;
    CCPA_DO_NOT_SELL_BUTTON: string;
    TCFV2_SECOND_LAYER_REJECT_ALL: string;
    TCFV2_SECOND_LAYER_ACCEPT_ALL: string;
};
export declare const AWS_REGIONS: {
    EU_WEST_1: string;
    US_WEST_1: string;
    CA_CENTRAL_1: string;
    AP_SOUTHEAST_2: string;
};
export type Stage = STAGES.PROD | STAGES.CODE | STAGES.LOCAL;
export type Jurisdiction = JURISDICTIONS.AUS | JURISDICTIONS.CCPA | JURISDICTIONS.TCFV2;
export type Config = {
    stage: Stage;
    jurisdiction: Jurisdiction;
    region: AwsRegionOpt;
    frontUrl: string;
    articleUrl: string;
    iframeDomain: string;
    iframeDomainSecondLayer: string;
    debugMode: boolean;
    isRunningAdhoc: boolean;
    checkFunction: (config: Config) => Promise<void>;
    platform: Stage;
};
export type SuccessfulCheck = {
    key: 'success';
};
export type FailedCheck = {
    key: 'failure';
    errorMessage: string;
};
export type UspData = {
    version: number;
    uspString: string;
    newUser: boolean;
    dateCreated: string;
    gpcEnabled: boolean;
};
export type CheckStatus = SuccessfulCheck | FailedCheck;
