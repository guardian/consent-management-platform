// eslint-disable-next-line import/no-unresolved -- This library is not in the public npm registry
import { synthetics } from "@amzn/synthetics-playwright";
import { main } from "./main";
import { Validation } from "./utils/validation";

export const handler = async () => {
	// Validate the input event
	Validation.hasCorrectEnvironmentVariables();
	const { region, stage } = process.env;
	await main(synthetics, region, stage);
};
