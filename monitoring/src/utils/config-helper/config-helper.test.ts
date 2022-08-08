import { AWS_REGIONS, JURISDICTIONS } from '../../types';
import { ConfigHelper } from './config-helper';

describe('Config Helper', () => {
	describe('getJurisdiction', () => {
		it('should return tcfv2 if region= eu-west-1', () => {
			const awsRegion = AWS_REGIONS.EU_WEST_1;
			const jurisdiction = ConfigHelper.getJurisdiction(awsRegion);
			expect(jurisdiction).toEqual(JURISDICTIONS.TCFV2);
		});

		it('should return ccpa if region= us-west-1', () => {
			const awsRegion = AWS_REGIONS.US_WEST_1;
			const jurisdiction = ConfigHelper.getJurisdiction(awsRegion);
			expect(jurisdiction).toEqual(JURISDICTIONS.CCPA);
		});

		it('should return tcfv2 if region= ca-central-1', () => {
			const awsRegion = AWS_REGIONS.CA_CENTRAL_1;
			const jurisdiction = ConfigHelper.getJurisdiction(awsRegion);
			expect(jurisdiction).toEqual(JURISDICTIONS.TCFV2);
		});
		it('should return aus if region= ap-southeast-2', () => {
			const awsRegion = AWS_REGIONS.AP_SOUTHEAST_2;
			const jurisdiction = ConfigHelper.getJurisdiction(awsRegion);
			expect(jurisdiction).toEqual(JURISDICTIONS.AUS);
		});
		it('should return tcfv2 if region= undefined', () => {
			const awsRegion = undefined;
			const jurisdiction = ConfigHelper.getJurisdiction(awsRegion);
			expect(jurisdiction).toEqual(JURISDICTIONS.TCFV2);
		});
	});

	describe('getRegion', () => {
		it('should return us-west-1 if jurisdiction= ccpa', () => {
			const jurisdiction = JURISDICTIONS.CCPA;
			const awsRegion = ConfigHelper.getRegion(jurisdiction);
			expect(awsRegion).toEqual(AWS_REGIONS.US_WEST_1);
		});

		it('should return ap-southeast-2  if jurisdiction= aus', () => {
			const jurisdiction = JURISDICTIONS.AUS;
			const awsRegion = ConfigHelper.getRegion(jurisdiction);

			expect(awsRegion).toEqual(AWS_REGIONS.AP_SOUTHEAST_2);
		});

		it('should return eu-west-1 if jurisdiction=  tcfv2', () => {
			const jurisdiction = JURISDICTIONS.TCFV2;
			const awsRegion = ConfigHelper.getRegion(jurisdiction);

			expect(awsRegion).toEqual(AWS_REGIONS.EU_WEST_1);
		});
		it('should return undefined if jurisdiction= undefined', () => {
			const jurisdiction = undefined;
			const awsRegion = ConfigHelper.getRegion(jurisdiction);

			expect(awsRegion).toEqual(undefined);
		});
	});
});
