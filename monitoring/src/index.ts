import { envConfig } from './config';

export const handler = async (): Promise<void> => {
	console.log(
		`(cmp monitoring) Starting cmp-monitoring for stage: ${envConfig.stage}, jurisdiction: ${envConfig.jurisdiction}`,
	);

	try {
		await envConfig.checkFunction(envConfig);
		console.log('(cmp monitoring) Finished cmp-monitoring');
	} catch (error) {
		console.log(error);
	}
};
