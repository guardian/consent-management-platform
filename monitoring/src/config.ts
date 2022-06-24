import { mainCheck as mainCheckAus } from './check-page/aus';
import { mainCheck as mainCheckCCPA } from './check-page/ccpa';
import { mainCheck as mainCheckTcfV2 } from './check-page/tcfv2';
import { debugMode, envAwsRegion, envJurisdiction, envStage } from './env';
import type { Config } from './types';

type JurisdictionOpt = string | undefined;
type AwsRegionOpt = string | undefined;

const decideJurisdiction = (
	jurisdiction: JurisdictionOpt,
	awsRegion: AwsRegionOpt,
): string => {
	jurisdiction;
	awsRegion;
	if (jurisdiction) {
		return jurisdiction;
	}
	if (awsRegion === 'eu-west-1') {
		return 'tcfv2';
	}
	if (awsRegion === 'us-west-1') {
		return 'ccpa';
	}
	if (awsRegion === 'ca-central-1') {
		return 'tcfv2';
	}
	if (awsRegion === 'ap-southeast-2') {
		return 'aus';
	}
	return 'tcfv2'; // default value
};

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

// export const envConfig: Config = ((
// 	_envJurisdiction: string,
// 	_envAwsRegion: string,
// ) => {
// 	const jurisdiction = decideJurisdiction(_envJurisdiction, envAwsRegion);
// 	const foundConfig = availableEnvConfig.find(
// 		(value) =>
// 			value.stage == envStage.toLowerCase() &&
// 			value.jurisdiction == jurisdiction,
// 	);

// 	if (foundConfig === undefined) {
// 		const j = envJurisdiction ?? 'missing';
// 		const r = envAwsRegion ?? 'missing';
// 		throw `No config found for (env)stage: ${envStage}, (env)jurisdiction: ${j}, (env)aws-region: ${r}`;
// 	}

// 	return foundConfig;
// })();

export class ConfigWrapper {
	public _jurisdiction: JurisdictionOpt | null;
	public _stage: string;

	private _awsRegion: AwsRegionOpt;
	private _config: Config | undefined;

	constructor(
		_envJurisdiction: JurisdictionOpt = envJurisdiction,
		_envAwsRegion: AwsRegionOpt = envAwsRegion,
		_envStage: string = envStage,
	) {
		this._jurisdiction = _envJurisdiction;
		this._awsRegion = _envAwsRegion;
		this._stage = _envStage;
	}

	async run(): Promise<void> {
		this.generateConfig();
		await this._config.checkFunction(this._config);
	}

	private generateConfig(): void {
		this._jurisdiction = this.decideJurisdiction(
			this._jurisdiction,
			this._awsRegion,
		);

		this._config = availableEnvConfig.find(
			(value) =>
				value.stage == this._stage.toLowerCase() &&
				value.jurisdiction == this._jurisdiction,
		);

		if (this._config === undefined) {
			const j = this._jurisdiction;
			const r = this._awsRegion ?? 'missing';
			throw `No config found for (env)stage: ${this._stage}, (env)jurisdiction: ${j}, (env)aws-region: ${r}`;
		}
	}

	private decideJurisdiction(
		jurisdiction: JurisdictionOpt,
		awsRegion: AwsRegionOpt,
	): string {
		if (jurisdiction) {
			return jurisdiction;
		}
		if (awsRegion === 'eu-west-1') {
			return 'tcfv2';
		}
		if (awsRegion === 'us-west-1') {
			return 'ccpa';
		}
		if (awsRegion === 'ca-central-1') {
			return 'tcfv2';
		}
		if (awsRegion === 'ap-southeast-2') {
			return 'aus';
		}
		return 'tcfv2'; // default value
	}
}
