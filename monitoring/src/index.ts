import type { Browser } from 'puppeteer-core';
import { run, terminate } from './puppeteer';
import { baseDomain, debugMode } from './utils/flags';

export const handler = async (): Promise<void> => {
	console.log('Starting cmp-monitoring');

	try {
		const browser: Browser = await run(null, baseDomain, debugMode);

		if (!debugMode) {
			await terminate(browser);
		}
		console.log('Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
