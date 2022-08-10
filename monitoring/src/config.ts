import { mainCheck as mainCheckAus } from './check-page/aus';
import { mainCheck as mainCheckCCPA } from './check-page/ccpa';
import { log_info } from './check-page/common-functions';
import { mainCheck as mainCheckTcfV2 } from './check-page/tcfv2';
import { debugMode, envAwsRegion, envJurisdiction, envStage } from './env';
import type {
	AwsRegionOpt,
	Config,
	Jurisdiction,
	JurisdictionOpt,
	Stage,
} from './types';
import { JURISDICTIONS, STAGES } from './types';
import { ConfigBuilder } from './utils/config-builder/config-builder';
import { ConfigHelper } from './utils/config-helper/config-helper';
import { Validator } from './utils/validator/validator';

const ConfigTcfv2Prod: Config = {
	stage: STAGES.PROD,
	jurisdiction: JURISDICTIONS.TCFV2,
	frontUrl: 'https://www.theguardian.com',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckTcfV2,
};

const ConfigTcfv2Code: Config = {
	stage: STAGES.CODE,
	jurisdiction: JURISDICTIONS.TCFV2,
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckTcfV2,
};

const ConfigTcfv2Local: Config = {
	stage: STAGES.LOCAL,
	jurisdiction: JURISDICTIONS.TCFV2,
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckTcfV2,
};

const ConfigCCPAProd: Config = {
	stage: STAGES.PROD,
	jurisdiction: JURISDICTIONS.CCPA,
	frontUrl: 'https://www.theguardian.com/us',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckCCPA,
};

const ConfigCCPACode: Config = {
	stage: STAGES.CODE,
	jurisdiction: JURISDICTIONS.CCPA,
	frontUrl: 'https://m.code.dev-theguardian.com/us',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckCCPA,
};

const ConfigCCPALocal: Config = {
	stage: STAGES.LOCAL,
	jurisdiction: JURISDICTIONS.CCPA,
	frontUrl: 'https://m.code.dev-theguardian.com/us',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckCCPA,
};

const ConfigAusProd: Config = {
	stage: STAGES.PROD,
	jurisdiction: JURISDICTIONS.AUS,
	frontUrl: 'https://www.theguardian.com/au',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	debugMode: debugMode,
	checkFunction: mainCheckAus,
};

const ConfigAusCode: Config = {
	stage: STAGES.CODE,
	jurisdiction: JURISDICTIONS.AUS,
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
	ConfigCCPALocal,
	ConfigTcfv2Local,
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

	get config(): Config | undefined {
		return this._config;
	}

	set config(value: Config | undefined) {
		this._config = value;
	}

	constructor(
		_envAwsRegion: AwsRegionOpt = envAwsRegion,
		_envStage: string = envStage,
		_envJurisdiction: JurisdictionOpt = envJurisdiction,
	) {
		this._jurisdiction = _envJurisdiction;
		this._awsRegion = _envAwsRegion;
		this._stage = _envStage.toLowerCase();
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

		// If the Jurisdiction or Stage value is not in the enum then throw an error
		if (
			!Validator.isStageJurisdiction(this._jurisdiction) ||
			!Validator.isStageValid(this._stage)
		) {
			const j = this._jurisdiction ? this._jurisdiction : 'missing';
			const r = this._awsRegion ? this._awsRegion : 'missing';
			throw `No config found for (env)stage: ${this._stage}, (env)jurisdiction: ${j}, (env)aws-region: ${r}`;
		}

		// Get the appropriate config
		this._config = ConfigBuilder.construct(
			<Stage>this._stage.toLowerCase(),
			<Jurisdiction>this._jurisdiction,
		);
	}
}
