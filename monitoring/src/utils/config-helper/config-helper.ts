import type { AwsRegionOpt, JurisdictionOpt } from '../../types.js';
import { AWS_REGIONS, JURISDICTIONS } from '../../types.js';

export class ConfigHelper {
	public static getJurisdiction(awsRegion: AwsRegionOpt): JurisdictionOpt {
		switch (awsRegion) {
			case AWS_REGIONS.EU_WEST_1:
				return JURISDICTIONS.TCFV2;
			case AWS_REGIONS.US_WEST_1:
				return JURISDICTIONS.CCPA;
			case AWS_REGIONS.CA_CENTRAL_1:
				return JURISDICTIONS.TCFV2;
			case AWS_REGIONS.AP_SOUTHEAST_2:
				return JURISDICTIONS.AUS;
			default:
				return JURISDICTIONS.TCFV2;
		}
	}

	public static getRegion(jurisdiction: JurisdictionOpt): AwsRegionOpt {
		switch (jurisdiction) {
			case JURISDICTIONS.CCPA:
				return AWS_REGIONS.US_WEST_1;
			case JURISDICTIONS.AUS:
				return AWS_REGIONS.AP_SOUTHEAST_2;
			case JURISDICTIONS.TCFV2:
				// return AWS_REGIONS.CA_CENTRAL_1;
				return AWS_REGIONS.EU_WEST_1;
			default:
				return undefined;
		}
	}
}
