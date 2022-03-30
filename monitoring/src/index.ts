import type { Browser } from 'puppeteer-core';
import { run } from './puppeteer';
import { envConfig } from './utils/config';
import { debugMode } from './utils/flags';

export const handler = async (): Promise<void> => {
	console.log(`Starting cmp-monitoring for ${envConfig.configKey}`);

	try {
		const browser: Browser = await run(envConfig, debugMode);

		if (!debugMode) {
			await browser.close();
		}
		console.log('Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
