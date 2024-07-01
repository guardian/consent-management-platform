import { mainCheck as mainCheckAus } from '../../check-page/aus.ts';
import { mainCheck as mainCheckCCPA } from '../../check-page/ccpa.ts';
import { mainCheck as mainCheckTcfV2 } from '../../check-page/tcfv2.ts';
import { debugMode, localBaseURL } from '../../env.ts';
import type { AwsRegionOpt, Config, Jurisdiction, Stage } from '../../types.ts';
import { JURISDICTIONS, STAGES } from '../../types.ts';

export class ConfigBuilder {
	static construct(
		stage: Stage,
		jurisdiction: Jurisdiction,
		region: AwsRegionOpt,
		isRunningAdhoc: boolean,
		platform: Stage
	): Config | undefined {
		const config: Config = {
			stage: stage,
			jurisdiction: jurisdiction,
			frontUrl: this.getFrontUrl(stage),
			articleUrl: this.getArticleUrl(stage),
			ampArticle: this.getAmpUrl(stage),
			iframeDomain: this.getIframeDomain(stage),
			iframeDomainSecondLayer: this.getIframeDomainSecondLayer(stage),
			checkFunction: this.getCheckFunction(jurisdiction),
			region: region,
			isRunningAdhoc: isRunningAdhoc,
			debugMode: debugMode,
			platform: platform
		};

		return config;
	}

	static getFrontUrl(stage: Stage): string {
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

	static getArticleUrl(stage: Stage): string {
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

	static getAmpUrl(stage: Stage): string {
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

	static getIframeDomain(stage: Stage): string {
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
	static getIframeDomainSecondLayer(stage: Stage): string {
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
	static getCheckFunction(
		jurisdiction: Jurisdiction,
	): (config: Config) => Promise<void> {
		switch (jurisdiction) {
			case JURISDICTIONS.AUS:
				return mainCheckAus;
			case JURISDICTIONS.CCPA:
				return mainCheckCCPA;
			case JURISDICTIONS.TCFV2:
				return mainCheckTcfV2;
			default:
				return mainCheckTcfV2;
		}
	}
}

export const ConfigArticleUrl = {
	PROD: 'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	CODE: 'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const ConfigFrontUrl = {
	PROD: 'https://www.theguardian.com',
	CODE: 'https://m.code.dev-theguardian.com',
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const ConfigAMPArticleURl = {
	PROD: 'https://amp.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	CODE: 'https://amp.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	LOCAL: `${localBaseURL}/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake?amp`,
};

export const IframeDomainUrl = {
	PROD: 'https://sourcepoint.theguardian.com',
	CODE: 'https://cdn.privacy-mgmt.com',
	LOCAL: 'https://cdn.privacy-mgmt.com',
};

export const IframeDomainUrlSecondLayer = {
	PROD: `${IframeDomainUrl.PROD}/privacy-manager`,
	CODE: `${IframeDomainUrl.CODE}/privacy-manager`,
	LOCAL: `${IframeDomainUrl.LOCAL}/privacy-manager`,
};
