import type { Browser } from 'puppeteer-core';
import { envConfig } from './config';
import { debugMode } from './env';
import { run } from './puppeteer';

export const handler = async (): Promise<void> => {
	console.log(
		`Starting cmp-monitoring at region ${
			process.env['AWS_REGION'] ??
			'Failed to read AWS_REGION from inside the Lambda'
		}`,
	);

	console.log(
		`Starting cmp-monitoring for ${envConfig.stage}, ${envConfig.jurisdiction}`,
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
