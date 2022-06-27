import type { AwsRegionOpt, JurisdictionOpt } from '../config';

export const AWS_REGIONS = {
	EU_WEST_1: 'eu-west-1',
	US_WEST_1: 'us-west-1',
	CA_CENTRAL_1: 'ca-central-1',
	AP_SOUTHEAST_2: 'ap-southeast-2',
};

export const JURISDICTIONS = {
	TCFV2: 'tcfv2',
	CCPA: 'ccpa',
	AUS: 'aus',
};

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

	public static checkJurisdiction(jurisdiction: JurisdictionOpt): boolean {
		let isAJurisdiction = false;

		Object.values(JURISDICTIONS).every((val) => {
			isAJurisdiction = val.toLowerCase() === jurisdiction;
			return !isAJurisdiction;
		});

		return isAJurisdiction;
	}
}
