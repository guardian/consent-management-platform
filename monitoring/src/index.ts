import { envConfig } from './config';
import type { CheckStatus } from './types';

export const handler = async (): Promise<CheckStatus> => {
	console.log(
		`(cmp monitoring) Starting cmp-monitoring for stage: ${envConfig.stage}, jurisdiction: ${envConfig.jurisdiction}`,
	);

	try {
		await envConfig.checkFunction(envConfig);
		console.log('(cmp monitoring) Finished successfully :)');

		return {
			key: 'success',
		};
	} catch (error) {
		let errorMessage = 'Unknown Error!';

		if (typeof error === 'string') {
			errorMessage = error;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		console.log(`(cmp monitoring) Finished with failure: ${errorMessage}`);

		return {
			key: 'failure',
			errorMessage: errorMessage,
		};
	}
};
