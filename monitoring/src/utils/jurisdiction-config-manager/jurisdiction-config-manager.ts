import { mainCheck as mainCheckAus } from '../../check-page/aus';
import { mainCheck as mainCheckCCPA } from '../../check-page/ccpa';
import { mainCheck as mainCheckTcfV2 } from '../../check-page/tcfv2';
import type { Config, Jurisdiction, Stage } from '../../types';
import { STAGES } from '../config-helper/config-helper';

export class JurisdictionConfigManager {
	static constructConfig(stage: Stage, jurisdiction: Jurisdiction): Config {
		const config: Config = {
			stage: stage,
			jurisdiction: jurisdiction,
			frontUrl: this.getFrontUrl(stage, jurisdiction),
		};

		return config;
	}

	static getFrontUrl(stage: Stage, jurisdiction: Jurisdiction): string {
		const baseUrl: string = '';
		switch (stage) {
			case STAGES.PROD:
				break;
			case STAGES.CODE:
				break;
			case STAGES.LOCAL:
				break;
		}

		return baseUrl;
	}
}
