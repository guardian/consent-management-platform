import { regionToJurisdictionMap } from "./helper";

const isRegionValid = (region) => {
	const validRegions = Object.keys(regionToJurisdictionMap);

	if (!validRegions.includes(region)) {
		throw new Error(
			`Invalid region: ${region}. Valid regions are: ${validRegions.join(", ")}`,
		);
	}

	return true;
};

const isStageValid = (stage) => {
	const validStages = ["CODE", "PROD"];

	if (!validStages.includes(stage)) {
		throw new Error(
			`Invalid stage: ${stage}. Valid stages are: ${validStages.join(", ")}`,
		);
	}

	return true;
};

const hasCorrectEnvironmentVariables = () => {
	const requiredEnvVars = ["region", "stage"];

	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			throw new Error(`Missing environment variable: ${envVar}`);
		}
	}

	if (!isRegionValid(process.env.region)) {
		throw new Error(`Invalid region: ${process.env.region}`);
	}
	if (!isStageValid(process.env.stage)) {
		throw new Error(`Invalid stage: ${process.env.stage}`);
	}

	return true;
};

module.exports = {
	hasCorrectEnvironmentVariables,
};
