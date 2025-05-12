import { AWS_REGIONS, JURISDICTIONS } from "../constants";

export class ConfigHelper {
	static getJurisdiction(region) {
		switch (region) {
			case AWS_REGIONS.EU_WEST_1:
				return JURISDICTIONS.TCFV2;
			case AWS_REGIONS.EU_WEST_2:
				return JURISDICTIONS.TCFV2CORP;
			case AWS_REGIONS.CA_CENTRAL_1:
				return JURISDICTIONS.TCFV2;
			case AWS_REGIONS.US_WEST_1:
				return JURISDICTIONS.USNAT;
			case AWS_REGIONS.AP_SOUTHEAST_2:
				return JURISDICTIONS.AUS;
			default:
				return JURISDICTIONS.TCFV2;
		}
	}

	static getRegion(jurisdiction) {
		switch (jurisdiction) {
			case JURISDICTIONS.TCFV2:
				return AWS_REGIONS.EU_WEST_1;
			case JURISDICTIONS.USNAT:
				return AWS_REGIONS.US_WEST_1;
			case JURISDICTIONS.AUS:
				return AWS_REGIONS.AP_SOUTHEAST_2;
			default:
				return AWS_REGIONS.EU_WEST_1;
		}
	}
}
