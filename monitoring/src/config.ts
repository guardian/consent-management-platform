import { log_info } from './check-page/common-functions';
import { envAwsRegion, envJurisdiction, envStage } from './env';
import type {
	AwsRegionOpt,
	Config,
	Jurisdiction,
	JurisdictionOpt,
	Stage,
} from './types';
import { ConfigBuilder } from './utils/config-builder/config-builder';
import { ConfigHelper } from './utils/config-helper/config-helper';
import { Validator } from './utils/validator/validator';

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
