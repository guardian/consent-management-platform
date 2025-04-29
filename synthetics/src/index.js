const { synthetics } = require("@amzn/synthetics-playwright");
const { hasCorrectEnvironmentVariables } = require("./utils/validation");

exports.handler = async () => {
	try {
		// Validate the input event
		hasCorrectEnvironmentVariables();

		const { region, stage } = process.env;
		console.log(`Region: ${region}, Stage: ${stage}`);

		// Launch a browser
		const browser = await synthetics.launch();

		// Create a new page
		const page = await synthetics.newPage(browser);
		console.log("Page created");
		// Navigate to a website
		await page.goto("https://www.theguardian.com/", { timeout: 10000 });
	} catch (error) {
		console.error("Error in handler:", error);
		throw error; // Rethrow the error to ensure the Lambda function fails
	} finally {
		// Ensure browser is closed
		await synthetics.close();
	}
};
