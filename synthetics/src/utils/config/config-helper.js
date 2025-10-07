import { AWS_REGIONS, JURISDICTIONS } from "../constants.js";

export class ConfigHelper {
	static getJurisdiction(region) {
		switch (region) {
			case AWS_REGIONS.EU_WEST_1:
				return JURISDICTIONS.TCFV2CORP_EU;
			case AWS_REGIONS.EU_WEST_2:
				return JURISDICTIONS.TCFV2CORP_GB;
			case AWS_REGIONS.CA_CENTRAL_1:
				return JURISDICTIONS.TCFV2_ROW;
			case AWS_REGIONS.US_WEST_1:
				return JURISDICTIONS.USNAT;
			case AWS_REGIONS.AP_SOUTHEAST_2:
				return JURISDICTIONS.AUS;
			default:
				return JURISDICTIONS.TCFV2_ROW;
		}
	}

	static getRegion(jurisdiction) {
		switch (jurisdiction) {
			case JURISDICTIONS.TCFV2_ROW:
				return AWS_REGIONS.CA_CENTRAL_1;
			case JURISDICTIONS.TCFV2CORP_EU:
				return AWS_REGIONS.EU_WEST_1;
			case JURISDICTIONS.TCFV2CORP_GB:
				return AWS_REGIONS.EU_WEST_2;
			case JURISDICTIONS.USNAT:
				return AWS_REGIONS.US_WEST_1;
			case JURISDICTIONS.AUS:
				return AWS_REGIONS.AP_SOUTHEAST_2;
			default:
				return AWS_REGIONS.EU_WEST_1;
		}
	}
}
