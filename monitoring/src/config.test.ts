import { ConfigWrapper } from './config';

describe('ConfigWrapper', () => {
	describe('Constructor', () => {
		const awsRegion = 'us-west-1';
		const stage = 'us-west-1';
		const jurisdiction = 'tcfv2';
		it('should assign jurisdiction, awsRegion or stage passed', () => {
			const configWrapper = new ConfigWrapper(
				awsRegion,
				stage,
				jurisdiction,
			);

			expect(configWrapper.jurisdiction).toBe(jurisdiction);
			expect(configWrapper.stage).toBe(stage);
			expect(configWrapper.awsRegion).toBe(awsRegion);
		});
	});
});
