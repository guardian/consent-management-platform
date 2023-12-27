import { ConfigWrapper } from './config';
import type { AwsRegionOpt, Config, JurisdictionOpt } from './types';
import { AWS_REGIONS, JURISDICTIONS, STAGES } from './types';
import { ConfigHelper } from './utils/config-helper/config-helper';

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
	describe('run', () => {
		const awsRegion: AwsRegionOpt = AWS_REGIONS.US_WEST_1;
		const jurisdiction: JurisdictionOpt = JURISDICTIONS.CCPA;
		const stage: string = 'code';

		it('should call config.checkFunction if config is defined', async () => {
			const configWrapper = new ConfigWrapper(
				awsRegion,
				stage,
				jurisdiction,
			);

			const mockCheckFunction = jest.fn();
			const mockConfig: Config = {
				stage: STAGES.CODE,
				jurisdiction: JURISDICTIONS.AUS,
				frontUrl: '',
				articleUrl: '',
				iframeDomain: '',
				iframeDomainSecondLayer: '',
				debugMode: true,
				isRunningAdhoc: true,
				region: AWS_REGIONS.AP_SOUTHEAST_2,
				checkFunction: mockCheckFunction,
				platform: STAGES.CODE
			};

			configWrapper.config = mockConfig;

			await configWrapper.run();
			expect(mockCheckFunction).toBeCalled();
		});
	});
});
