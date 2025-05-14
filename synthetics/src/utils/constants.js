export const JURISDICTIONS = {
	TCFV2: "tcfv2",
	TCFV2CORP: "tcfv2_corp",
	USNAT: "usnat",
	AUS: "aus",
};

export const STAGES = {
	PROD: "prod",
	CODE: "code",
	LOCAL: "local",
};

export const AWS_REGIONS = {
	EU_WEST_1: "eu-west-1", // Ireland
	EU_WEST_2: "eu-west-2", // London
	US_WEST_1: "us-west-1", // N. California
	CA_CENTRAL_1: "ca-central-1", // Canada
	AP_SOUTHEAST_2: "ap-southeast-2", // Sydney
};

export const ELEMENT_ID = {
	TCFV2_FIRST_LAYER_ACCEPT_ALL:
		"div.message-component.message-row > button.sp_choice_type_11",
	TCFV2_FIRST_LAYER_REJECT_ALL:
		"div.message-component.message-row > button.sp_choice_type_13",
	TCFV2_CORP_FIRST_LAYER_REJECT_SUBSCRIBE:
		"div.message-component.gu-cta-row-flex > button.sp_choice_type_9",
	TCFV2_FIRST_LAYER_MANAGE_COOKIES:
		"div.message-component.message-row > button.sp_choice_type_12",
	TOP_ADVERT: ".ad-slot--top-above-nav .ad-slot__content",
	CMP_CONTAINER: 'iframe[id*="sp_message_iframe"]',
	CMP_ACTIONS_ROW: ".gu-actions-row",
	TCFV2_SECOND_LAYER_SAVE_AND_EXIT: "button.sp_choice_type_SAVE_AND_EXIT",
	TCFV2_SECOND_LAYER_HEADLINE: "p.gu-privacy-headline",
	CCPA_DO_NOT_SELL_BUTTON: "div.message-component > button.sp_choice_type_13",
	TCFV2_SECOND_LAYER_REJECT_ALL: "button.sp_choice_type_REJECT_ALL",
	TCFV2_SECOND_LAYER_ACCEPT_ALL: "button.sp_choice_type_ACCEPT_ALL",
	AMP_CMP_CONTAINER: ".i-amphtml-consent-ui-fill",
};

export const BannerInteractions = {
	ACCEPT_ALL: "accept_all",
	REJECT_AND_SUBSCRIBE: "reject_and_subscribe",
	REJECT_ALL: "reject_all",
	MANAGE_COOKIES: "manage_cookies",
	DO_NOT_SELL: "do_not_sell",
};
