import type { Browser } from 'puppeteer-core';
import { envConfig } from './config';
import { debugMode } from './env';
import { run } from './puppeteer';

export const handler = async (): Promise<void> => {
	console.log(
		`Starting cmp-monitoring for ${envConfig.configKey}, ${envConfig.regionKey}`,
	);

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
