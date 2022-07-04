import type { AwsRegionOpt, JurisdictionOpt } from './config';
import { ConfigWrapper } from './config';
import {
	AWS_REGIONS,
	ConfigHelper,
	JURISDICTIONS,
} from './utils/config-helper';

describe('ConfigWrapper', () => {
	describe('Constructor', () => {
		const awsRegion = AWS_REGIONS.US_WEST_1;
		const stage = 'code';
		const jurisdiction = JURISDICTIONS.AUS;
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

	describe('generateConfig', () => {
		let awsRegion: AwsRegionOpt = AWS_REGIONS.US_WEST_1;
		let jurisdiction: JurisdictionOpt = JURISDICTIONS.CCPA;
		const stage: string = 'code';
		it('should assign jurisdiction if there is an awsRegion and no jurisdiction ', () => {
			jurisdiction = undefined;
			awsRegion = AWS_REGIONS.US_WEST_1;

			const configWrapper = new ConfigWrapper(
				awsRegion,
				stage,
				jurisdiction,
			);

			expect(configWrapper.jurisdiction).toBeUndefined();
			expect(configWrapper.config).toBeUndefined();
			expect(configWrapper.stage).toBe(stage);
			expect(configWrapper.awsRegion).toBe(awsRegion);

			configWrapper.generateConfig();

			expect(configWrapper.jurisdiction).toBe(
				ConfigHelper.getJurisdiction(awsRegion),
			);
			expect(configWrapper.config).not.toBeUndefined();
		});

		it('should assign awsRegion if there is an jurisdiction and no awsRegion ', () => {
			awsRegion = undefined;
			jurisdiction = JURISDICTIONS.AUS;

			const configWrapper = new ConfigWrapper(
				awsRegion,
				stage,
				jurisdiction,
			);

			expect(configWrapper.awsRegion).toBeUndefined();
			expect(configWrapper.config).toBeUndefined();
			expect(configWrapper.stage).toBe(stage);
			expect(configWrapper.jurisdiction).toBe(jurisdiction);

			configWrapper.generateConfig();

			expect(configWrapper.awsRegion).toBe(
				ConfigHelper.getRegion(jurisdiction),
			);
			expect(configWrapper.config).not.toBeUndefined();
		});

		it('should throw error if it cant find the appropriate config file ', () => {
			jurisdiction = 'JURISDICTION_THAT_DOES _NOT_EXIST';
			awsRegion = undefined;
			const configWrapper = new ConfigWrapper(
				awsRegion,
				stage,
				jurisdiction,
			);

			// configWrapper.generateConfig();

			expect(() => configWrapper.generateConfig()).toThrowError();
		});
	});
});
