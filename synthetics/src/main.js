import { ConfigWrapper } from "./utils/config/config-wrapper.js";
import { Log } from "./utils/log.js";

export const main = async (browserType, region, stage) => {
	try {
		const configWrapper = new ConfigWrapper(
			region.toLowerCase(),
			stage.toLowerCase(),
			null,
		);
		configWrapper.generateConfig();
		Log.info("Config generated:", configWrapper.config);

		await configWrapper.run(browserType);
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
	} finally {
		// Ensure browser is closed
		await browserType.close();
	}
};
