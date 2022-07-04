import { mainCheck as mainCheckAus } from './check-page/aus';
import { mainCheck as mainCheckCCPA } from './check-page/ccpa';
import { log_info } from './check-page/common-functions';
import { mainCheck as mainCheckTcfV2 } from './check-page/tcfv2';
import { debugMode, envAwsRegion, envJurisdiction, envStage } from './env';
import type { Config } from './types';
import { ConfigHelper } from './utils/config-helper';

export type JurisdictionOpt = string | undefined;

export type AwsRegionOpt = string | undefined;

const ConfigTcfv2Prod: Config = {
	stage: 'prod',
	jurisdiction: 'tcfv2',
	frontUrl: 'https://www.theguardian.com',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckTcfV2,
};

const ConfigTcfv2Code: Config = {
	stage: 'code',
	jurisdiction: 'tcfv2',
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckTcfV2,
};

const ConfigCCPAProd: Config = {
	stage: 'prod',
	jurisdiction: 'ccpa',
	frontUrl: 'https://www.theguardian.com/us',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckCCPA,
};

const ConfigCCPACode: Config = {
	stage: 'code',
	jurisdiction: 'ccpa',
	frontUrl: 'https://m.code.dev-theguardian.com/us',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckCCPA,
};

const ConfigAusProd: Config = {
	stage: 'prod',
	jurisdiction: 'aus',
	frontUrl: 'https://www.theguardian.com/au',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckAus,
};

const ConfigAusCode: Config = {
	stage: 'code',
	jurisdiction: 'aus',
	frontUrl: 'https://m.code.dev-theguardian.com/au',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckAus,
};

const availableEnvConfig = [
	ConfigTcfv2Prod,
	ConfigTcfv2Code,
	ConfigCCPAProd,
	ConfigCCPACode,
	ConfigAusProd,
	ConfigAusCode,
];

export class ConfigWrapper {
	private _jurisdiction: JurisdictionOpt;
	private _stage: string;
	private _awsRegion: AwsRegionOpt;
	private _config: Config | undefined;

	get stage(): string {
		return this._stage;
	}

	get jurisdiction(): JurisdictionOpt {
		return this._jurisdiction;
	}

	get awsRegion(): AwsRegionOpt {
		return this._awsRegion;
	}

	constructor(
		_envAwsRegion: AwsRegionOpt = envAwsRegion,
		_envStage: string = envStage,
		_envJurisdiction: JurisdictionOpt = envJurisdiction,
	) {
		this._jurisdiction = _envJurisdiction;
		this._awsRegion = _envAwsRegion;
		this._stage = _envStage;
	}

	async run(): Promise<void> {
		if (this._config) {
			await this._config.checkFunction(this._config);
		}
	}

	public generateConfig(): void {
		// If no jurisdiction assign using aws region (Scheduled)
		if (!this._jurisdiction && this._awsRegion) {
			this._jurisdiction = ConfigHelper.getJurisdiction(this._awsRegion);
			log_info(`Generating config for scheduled trigger`);
		}

		// If no aws Region assign using jurisdiction (Adhoc)
		if (!this._awsRegion && this._jurisdiction) {
			this._awsRegion = ConfigHelper.getRegion(this._jurisdiction);
			log_info(`Generating config for adhoc trigger`);
		}

		// Get the appropriate config file
		this._config = availableEnvConfig.find(
			(value) =>
				value.stage == this._stage.toLowerCase() &&
				value.jurisdiction == this._jurisdiction,
		);

		// If the config doesn't exist then throw error
		if (this._config === undefined) {
			const j = this._jurisdiction ? this._jurisdiction : 'missing';
			const r = this._awsRegion ? this._awsRegion : 'missing';
			throw `No config found for (env)stage: ${this._stage}, (env)jurisdiction: ${j}, (env)aws-region: ${r}`;
		}
	}
}
