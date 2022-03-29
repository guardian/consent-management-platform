import type { Browser } from 'puppeteer-core';
import { run } from './puppeteer';
import { baseDomain, debugMode } from './utils/flags';

export const handler = async (): Promise<void> => {
	console.log('Starting cmp-monitoring');

	try {
		const browser: Browser = await run(baseDomain, debugMode);

		if (!debugMode) {
			await browser.close();
		}
		console.log('Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
