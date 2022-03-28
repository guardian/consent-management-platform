import { run, terminate } from './puppeteer';
import { debugMode, baseDomain } from './utils/flags';

export const handler = async (): Promise<void> => {
	console.log('hey there universe');

	let browser = null;

	try {
		browser = await run(
			browser,
			baseDomain,
			debugMode,
		);
	} catch (error) {
		console.log(error);
	} finally {
		if (!debugMode) {
			await terminate(browser);
		}
	}
};
