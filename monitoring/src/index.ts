import { envConfig } from './config';
import { run } from './puppeteer';

export const handler = async (): Promise<void> => {
	console.log(
		`(cmp monitoring) Starting cmp-monitoring for stage: ${envConfig.stage}, jurisdiction: ${envConfig.jurisdiction}`,
	);

	try {
		await run(envConfig);
		console.log('(cmp monitoring) Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
