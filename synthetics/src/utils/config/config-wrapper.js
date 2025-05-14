import { Log } from "../log.js";
import { Validation } from "../validation.js";
import { ConfigBuilder } from "./config-builder.js";
import { ConfigHelper } from "./config-helper.js";

export class ConfigWrapper {
	_jurisdiction;
	_stage;
	_awsRegion;
	_config;
	_isRunningAdhoc;

	get stage() {
		return this._stage;
	}

	get jurisdiction() {
		return this._jurisdiction;
	}
	get awsRegion() {
		return this._awsRegion;
	}
	get config() {
		return this._config;
	}
	get isRunningAdhoc() {
		return this._isRunningAdhoc;
	}

	constructor(_envAwsRegion, _envStage, _envJurisdiction) {
		this._jurisdiction = _envJurisdiction;
		this._stage = _envStage;
		this._awsRegion = _envAwsRegion;
	}

	async run(browserType) {
		if (this._config) {
			await this._config.checkFunction(browserType, this._config);
		}
	}

	generateConfig() {
		// If no jurisdiction is provided, assign using aws region (Scheduled)
		if (!this._jurisdiction && this._awsRegion) {
			Validation.isRegionValid(this._awsRegion);
			this._jurisdiction = ConfigHelper.getJurisdiction(this._awsRegion);
			this._isRunningAdhoc = false;
			Log.info("Generating config for scheduled run");
		}

		// If no aws region is provided, assign using jurisdiction (Ad-hoc)
		if (!this._awsRegion && this._jurisdiction) {
			Validation.isJurisdictionValid(this._jurisdiction);
			this._awsRegion = ConfigHelper.getRegion(this._jurisdiction);
			this._isRunningAdhoc = true;
			Log.info("Generating config for ad-hoc run");
		}

		Log.info(
			`Config variables - for jurisdiction:${this._jurisdiction}, stage: ${this._stage} and aws region: ${this._awsRegion}`,
		);
		// Validate the jursidiction and stage
		Validation.isJurisdictionValid(this._jurisdiction);
		Validation.isStageValid(this._stage);

		this._config = ConfigBuilder.construct(
			this._stage,
			this._jurisdiction,
			this._awsRegion,
			this._isRunningAdhoc,
		);
	}
}
