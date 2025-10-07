import { AWS_REGIONS, JURISDICTIONS } from "../constants.js";
import { ConfigHelper } from "./config-helper";

describe("Config Helper", () => {
	describe("getJurisdiction", () => {
		it("should return TCFV2CORP_EU for EU_WEST_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.EU_WEST_1)).toBe(
				JURISDICTIONS.TCFV2CORP_EU,
			);
		});

		it("should return TCFV2CORP_GB for EU_WEST_2", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.EU_WEST_2)).toBe(
				JURISDICTIONS.TCFV2CORP_GB,
			);
		});

		it("should return TCFV2 for CA_CENTRAL_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.CA_CENTRAL_1)).toBe(
				JURISDICTIONS.TCFV2_ROW,
			);
		});

		it("should return USNAT for US_WEST_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.US_WEST_1)).toBe(
				JURISDICTIONS.USNAT,
			);
		});

		it("should return AUS for AP_SOUTHEAST_2", () => {
			expect(
				ConfigHelper.getJurisdiction(AWS_REGIONS.AP_SOUTHEAST_2),
			).toBe(JURISDICTIONS.AUS);
		});

		it("should throw an error for an invalid region", () => {
			expect(ConfigHelper.getJurisdiction("invalid-region")).toBe(
				JURISDICTIONS.TCFV2_ROW,
			);
		});
	});

	describe("getRegion", () => {
		it("should return CA_CENTRAL_1 for TCFV2", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.TCFV2_ROW)).toBe(
				AWS_REGIONS.CA_CENTRAL_1,
			);
		});

		it("should return EU_WEST_2 for TCFV2CORP_GB", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.TCFV2CORP_GB)).toBe(
				AWS_REGIONS.EU_WEST_2,
			);
		});

		it("should return EU_WEST_1 for TCFV2CORP_EU", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.TCFV2CORP_EU)).toBe(
				AWS_REGIONS.EU_WEST_1,
			);
		});

		it("should return US_WEST_1 for USNAT", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.USNAT)).toBe(
				AWS_REGIONS.US_WEST_1,
			);
		});

		it("should return AP_SOUTHEAST_2 for AUS", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.AUS)).toBe(
				AWS_REGIONS.AP_SOUTHEAST_2,
			);
		});

		it("should return EU_WEST_1 for an invalid jurisdiction", () => {
			expect(ConfigHelper.getRegion("invalid-jurisdiction")).toBe(
				AWS_REGIONS.EU_WEST_1,
			);
		});
	});
});
