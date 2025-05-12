import { mainCheck as mainCheckAus } from "../../jurisdiction-checks/aus.js";
import { mainCheck as mainCheckTCFV2 } from "../../jurisdiction-checks/tcfv2-basic.js";
import { mainCheck as mainCheckTCFV2ConsentOrPay } from "../../jurisdiction-checks/tcfv2-consent-or-pay.js";
import { mainCheck as mainCheckUS } from "../../jurisdiction-checks/us.js";
import { JURISDICTIONS, STAGES } from "../constants.js";

export class ConfigBuilder {
	static construct(stage, jurisdiction, region, isRunningAdhoc) {
		const config = {
			stage: stage,
			jurisdiction: jurisdiction,
			region: region,
			isRunningAdhoc: isRunningAdhoc,
			debugMode: process.env["DEBUG_MODE"] == "true",
			frontUrl: this.getFrontUrl(stage),
			articleUrl: this.getArticleUrl(stage),
			ampArticle: this.getAMPArticleUrl(stage),
			iframeDomainUrl: this.getIframeDomainUrl(stage),
			iframeDomainUrlSecondLayer:
				this.getIframeDomainUrlSecondLayer(stage),
			checkFunction: this.getCheckFunctionForJurisdiction(jurisdiction),
		};

		return config;
	}

	static getFrontUrl(stage) {
		switch (stage) {
			case STAGES.PROD:
				return ConfigFrontUrl.PROD;
			case STAGES.CODE:
				return ConfigFrontUrl.CODE;
			case STAGES.LOCAL:
				return ConfigFrontUrl.LOCAL;
			default:
				return ConfigFrontUrl.CODE;
		}
	}

	static getArticleUrl(stage) {
		switch (stage) {
			case STAGES.PROD:
				return ConfigArticleUrl.PROD;
			case STAGES.CODE:
				return ConfigArticleUrl.CODE;
			case STAGES.LOCAL:
				return ConfigArticleUrl.LOCAL;
			default:
				return ConfigArticleUrl.CODE;
		}
	}

	static getAMPArticleUrl(stage) {
		switch (stage) {
			case STAGES.PROD:
				return ConfigAMPArticleURl.PROD;
			case STAGES.CODE:
				return ConfigAMPArticleURl.CODE;
			case STAGES.LOCAL:
				return ConfigAMPArticleURl.LOCAL;
			default:
				return ConfigAMPArticleURl.CODE;
		}
	}

	static getIframeDomainUrl(stage) {
		switch (stage) {
			case STAGES.PROD:
				return IframeDomainUrl.PROD;
			case STAGES.CODE:
				return IframeDomainUrl.CODE;
			case STAGES.LOCAL:
				return IframeDomainUrl.LOCAL;
			default:
				return IframeDomainUrl.CODE;
		}
	}

	static getIframeDomainUrlSecondLayer(stage) {
		switch (stage) {
			case STAGES.PROD:
				return IframeDomainUrlSecondLayer.PROD;
			case STAGES.CODE:
				return IframeDomainUrlSecondLayer.CODE;
			case STAGES.LOCAL:
				return IframeDomainUrlSecondLayer.LOCAL;
			default:
				return IframeDomainUrlSecondLayer.CODE;
		}
	}

	static getCheckFunctionForJurisdiction(jurisdiction) {
		switch (jurisdiction) {
			case JURISDICTIONS.TCFV2:
				return mainCheckTCFV2;
			case JURISDICTIONS.CCPA:
				return mainCheckUS;
			case JURISDICTIONS.AUS:
				return mainCheckAus;
			case JURISDICTIONS.TCFV2CORP:
				return mainCheckTCFV2ConsentOrPay;
			default:
				return mainCheckTCFV2;
		}
	}
}

const localBaseURL = process.env["LOCAL_BASE_URL"]
	? process.env["LOCAL_BASE_URL"]
	: "http://localhost:9000";

export const ConfigArticleUrl = {
	PROD: "https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake",
	CODE: "https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake",
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const ConfigFrontUrl = {
	PROD: "https://www.theguardian.com",
	CODE: "https://m.code.dev-theguardian.com",
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const ConfigAMPArticleURl = {
	PROD: "https://amp.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake",
	CODE: "https://amp.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake",
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake?amp`,
};

export const IframeDomainUrl = {
	PROD: "https://sourcepoint.theguardian.com",
	CODE: "https://cdn.privacy-mgmt.com",
	LOCAL: "https://cdn.privacy-mgmt.com",
};

export const IframeDomainUrlSecondLayer = {
	PROD: `${IframeDomainUrl.PROD}/privacy-manager`,
	CODE: `${IframeDomainUrl.CODE}/privacy-manager`,
	LOCAL: `${IframeDomainUrl.LOCAL}/privacy-manager`,
};
