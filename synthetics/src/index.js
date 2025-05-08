// eslint-disable-next-line import/no-unresolved -- This library is notavailable in npm
import { synthetics } from "@amzn/synthetics-playwright";
import { ConfigWrapper } from "./utils/config/config-wrapper";
import { Validation } from "./utils/validation";


export const handler = async () => {
	try {
		// Validate the input event
		Validation.hasCorrectEnvironmentVariables();

		const { region, stage } = process.env;
		console.log(`Region: ${region}, Stage: ${stage}`);

		const configWrapper = new ConfigWrapper(
			region.toLowerCase(),
			stage.toLowerCase(),
			null,
		);
		configWrapper.generateConfig();
		console.log("Config generated:", configWrapper.config);


		try {
			await configWrapper.run();
		} catch (error) {
			let errorMessage = 'Unknown Error!';

			if (typeof error === 'string') {
				errorMessage = error;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			console.log(`(cmp monitoring) Finished with failure: ${errorMessage}`);

			throw new Error(errorMessage);
		}

	} catch (error) {
		console.error("Error in handler:", error);
		throw error; // Rethrow the error to ensure the Lambda function fails
	} finally {
		// Ensure browser is closed
		await synthetics.close();
	}
};
