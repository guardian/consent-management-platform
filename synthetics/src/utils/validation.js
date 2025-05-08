import { AWS_REGIONS, JURISDICTIONS, STAGES } from "./constants.js";

export class Validation {
	static isJurisdictionValid(jurisdiction) {
		const validJurisdictions = Object.values(JURISDICTIONS);

		if (!validJurisdictions.includes(jurisdiction)) {
			throw new Error(
				`Invalid jurisdiction: ${jurisdiction}. Valid JURISDICTIONS are: ${validJurisdictions.join(
					", ",
				)}`,
			);
		}

		return true;
	}

	static isRegionValid(region) {
		const validRegions = Object.values(AWS_REGIONS);

		if (!validRegions.includes(region)) {
			throw new Error(
				`Invalid region: ${region}. Valid regions are: ${validRegions.join(", ")}`,
			);
		}

		return true;
	}
	static isStageValid(stage) {
		const validStages = Object.values(STAGES);

		if (!validStages.includes(stage)) {
			throw new Error(
				`Invalid stage: ${stage}. Valid stages are: ${validStages.join(", ")}`,
			);
		}

		return true;
	}
	static hasCorrectEnvironmentVariables() {
		const requiredEnvVars = ["region", "stage"];

		for (const envVar of requiredEnvVars) {
			if (!process.env[envVar]) {
				throw new Error(`Missing environment variable: ${envVar}`);
			}
		}

		if (!this.isRegionValid(process.env.region.toLowerCase())) {
			throw new Error(`Invalid region: ${process.env.region}`);
		}
		if (!this.isStageValid(process.env.stage.toLowerCase())) {
			throw new Error(`Invalid stage: ${process.env.stage}`);
		}

		return true;
	}
}
