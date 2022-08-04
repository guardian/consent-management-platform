import { mainCheck as mainCheckAus } from '../../check-page/aus';
import { mainCheck as mainCheckCCPA } from '../../check-page/ccpa';
import { mainCheck as mainCheckTcfV2 } from '../../check-page/tcfv2';
import { debugMode, localBaseURL } from '../../env';
import type { Config, Jurisdiction, Stage } from '../../types';
import { JURISDICTIONS, STAGES } from '../../types';

export class ConfigBuilder {
	static construct(
		stage: Stage,
		jurisdiction: Jurisdiction,
	): Config | undefined {
		const config: Config = {
			stage: stage,
			jurisdiction: jurisdiction,
			frontUrl: this.getFrontUrl(stage),
			articleUrl: this.getArticleUrl(stage),
			iframeDomain: this.getIframeDomain(stage),
			checkFunction: this.getCheckFunction(jurisdiction),
			debugMode: debugMode,
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
	LOCAL: `${localBaseURL}/Article?url=https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const ConfigFrontUrl = {
	PROD: 'https://www.theguardian.com',
	CODE: 'https://m.code.dev-theguardian.com',
	LOCAL: `${localBaseURL}/Article?url=https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake`,
};

export const IframeDomainUrl = {
	PROD: 'https://sourcepoint.theguardian.com',
	CODE: 'https://sourcepoint.theguardian.com',
	LOCAL: `${localBaseURL}/Article?url=https://sourcepoint.theguardian.com`,
};
