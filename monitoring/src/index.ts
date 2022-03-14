import {run, terminate} from './puppeteer'

export const handler = async () => {
	console.log("hey there universe");

	let browser = null;
	const isDebugMode = true

	try {
		browser = await run(browser, 'https://www.theguardian.com', isDebugMode)
	} catch (error) {
		console.log(error)
	} finally {
		if(!isDebugMode) {
			await terminate(browser)
		}
	}
};
