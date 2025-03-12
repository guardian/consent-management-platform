declare global {
	interface Window {
		// 		__uspapi: (
		// 			command: string,
		// 			version: number,
		// 			callback: (uspData: UspData) => void,
		// 		) => undefined;
		_sp_: { version: string };
	}
}

export type JurisdictionOpt = string | undefined;

export type AwsRegionOpt = string | undefined;

export enum JURISDICTIONS {
	TCFV2 = 'tcfv2',
	TCFV2CORP = 'tcfv2_corp',
	CCPA = 'ccpa',
	AUS = 'aus',
}

export enum STAGES {
	PROD = 'prod',
	CODE = 'code',
	LOCAL = 'local',
}

export const ELEMENT_ID = {
	TCFV2_FIRST_LAYER_ACCEPT_ALL:
		'div.message-component.message-row > button.sp_choice_type_11',
	TCFV2_FIRST_LAYER_REJECT_ALL:
		'div.message-component.message-row > button.sp_choice_type_13',
	TCFV2_CORP_FIRST_LAYER_REJECT_SUBSCRIBE:
		'div.message-component.message-row > button.sp_choice_type_9',
	TCFV2_FIRST_LAYER_MANAGE_COOKIES:
		'div.message-component.message-row > button.sp_choice_type_12',
	TOP_ADVERT: '.ad-slot--top-above-nav .ad-slot__content',
	CMP_CONTAINER: 'iframe[id*="sp_message_iframe"]',
	TCFV2_SECOND_LAYER_SAVE_AND_EXIT: 'button.sp_choice_type_SAVE_AND_EXIT',
	TCFV2_SECOND_LAYER_HEADLINE: 'p.gu-privacy-headline',
	CCPA_DO_NOT_SELL_BUTTON: 'div.message-component > button.sp_choice_type_13',
	TCFV2_SECOND_LAYER_REJECT_ALL: 'button.sp_choice_type_REJECT_ALL',
	TCFV2_SECOND_LAYER_ACCEPT_ALL: 'button.sp_choice_type_ACCEPT_ALL',
	AMP_CMP_CONTAINER: '.i-amphtml-consent-ui-fill'
};

export const AWS_REGIONS = {
	EU_WEST_1: 'eu-west-1',
	EU_WEST_2: 'eu-west-2',
	US_WEST_1: 'us-west-1',
	CA_CENTRAL_1: 'ca-central-1',
	AP_SOUTHEAST_2: 'ap-southeast-2',
};

export type Stage = STAGES.PROD | STAGES.CODE | STAGES.LOCAL;

export type Jurisdiction =
	| JURISDICTIONS.AUS
	| JURISDICTIONS.CCPA
	| JURISDICTIONS.TCFV2
	| JURISDICTIONS.TCFV2CORP;

export type Config = {
	stage: Stage;
	jurisdiction: Jurisdiction;
	region: AwsRegionOpt;
	frontUrl: string;
	ampArticle: string;
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

export const BannerInteractions = {
	ACCEPT_ALL: 'accept_all',
	REJECT_AND_SUBSCRIBE: 'reject_and_subscribe',
	REJECT_ALL: 'reject_all',
} as const;

export type BannerInteraction =
	(typeof BannerInteractions)[keyof typeof BannerInteractions];
