import { Validation } from "../validation";
import { ConfigBuilder } from "./config-builder";
import { ConfigHelper } from "./config-helper";

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

		console.log("ConfigWrapper constructor called", _envAwsRegion, _envStage, _envJurisdiction);
	}

	async run() {
		if(this._config) {
			await this._config.checkFunction(this._config);
		}
	}

	generateConfig() {
		// If no jurisdiction is provided, assign using aws region (Scheduled)
		if (!this._jurisdiction  && this._awsRegion) {
			Validation.isRegionValid(this._awsRegion);
			this._jurisdiction = ConfigHelper.getJurisdiction(this._awsRegion);
			this._isRunningAdhoc = false;
			console.log("Generating config for scheduled run");
		}

		// If no aws region is provided, assign using jurisdiction (Ad-hoc)
		if (!this._awsRegion && this._jurisdiction) {
			Validation.isJurisdictionValid(this._jurisdiction);
			this._awsRegion = ConfigHelper.getRegion(this._jurisdiction);
			this._isRunningAdhoc = true;
			console.log("Generating config for ad-hoc run");
		}

		console.log('Generating config for jurisdiction:', this._jurisdiction);
		console.log('Generating config for stage:', this._stage);
		console.log('Generating config for aws region:', this._awsRegion);

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
