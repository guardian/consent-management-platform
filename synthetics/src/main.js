import { ConfigWrapper } from "./utils/config/config-wrapper.js";
import { Log } from "./utils/log.js";

export const main = async (browserType, region, stage, spEnv) => {
	try {
		const configWrapper = new ConfigWrapper(
			region.toLowerCase(),
			stage.toLowerCase(),
			null,
			spEnv.toLowerCase(),
		);
		configWrapper.generateConfig();
		Log.info("Config generated:", configWrapper.config);

		await configWrapper.run(browserType);

		Log.info("Tests completed successfully");
	} catch (error) {
		let errorMessage = "Unknown Error!";

		if (typeof error === "string") {
			errorMessage = error;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		Log.error(`Finished with failure: ${errorMessage}`);
		console.error("Error in handler:", error);
		throw error; // Rethrow the error to ensure the Lambda function fails
	}
};
