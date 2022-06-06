import type { Browser } from 'puppeteer-core';
import { envConfig } from './config';
import { debugMode } from './env';
import { run } from './puppeteer';

export const handler = async (): Promise<void> => {
	console.log(
		`(cmp monitoring) Starting cmp-monitoring for stage: ${envConfig.stage}, jurisdiction: ${envConfig.jurisdiction}`,
	);

	try {
		const browser: Browser = await run(envConfig, debugMode);

		if (!debugMode) {
			await browser.close();
		}
		console.log('(cmp monitoring) Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
