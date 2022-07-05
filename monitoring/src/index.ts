import type { AwsRegionOpt, JurisdictionOpt } from './config';
import { ConfigWrapper } from './config';
import type { CheckStatus } from './types';

export interface CustomScheduleEventContent {
	jurisdiction?: string;
	stage: string;
	region?: string;
}

export const handler = async (
	event: CustomScheduleEventContent,
): Promise<CheckStatus> => {
	const jurisdiction: JurisdictionOpt = event.jurisdiction;
	const stage: string = event.stage;
	const region: AwsRegionOpt = event.region;

	const configWrapper = new ConfigWrapper(region, stage, jurisdiction);
	configWrapper.generateConfig();

	console.log(
		`(cmp monitoring) Starting cmp-monitoring for stage: ${
			configWrapper.stage
		}, jurisdiction: ${
			configWrapper.jurisdiction ? configWrapper.jurisdiction : 'missing '
		}`,
	);

	try {
		await configWrapper.run();
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

		throw new Error(errorMessage);
	}
};
