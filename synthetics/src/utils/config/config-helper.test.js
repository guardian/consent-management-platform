import { AWS_REGIONS, JURISDICTIONS } from "../constants.js";
import { ConfigHelper } from "./config-helper";

describe("Config Helper", () => {
	describe("getJurisdiction", () => {
		it("should return TCFV2 for EU_WEST_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.EU_WEST_1)).toBe(
				JURISDICTIONS.TCFV2,
			);
		});

		it("should return TCFV2 for EU_WEST_2", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.EU_WEST_2)).toBe(
				JURISDICTIONS.TCFV2CORP,
			);
		});

		it("should return TCFV2 for CA_CENTRAL_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.CA_CENTRAL_1)).toBe(
				JURISDICTIONS.TCFV2,
			);
		});

		it("should return CCPA for US_WEST_1", () => {
			expect(ConfigHelper.getJurisdiction(AWS_REGIONS.US_WEST_1)).toBe(
				JURISDICTIONS.CCPA,
			);
		});

		it("should return AUS for AP_SOUTHEAST_2", () => {
			expect(
				ConfigHelper.getJurisdiction(AWS_REGIONS.AP_SOUTHEAST_2),
			).toBe(JURISDICTIONS.AUS);
		});

		it("should throw an error for an invalid region", () => {
			expect(ConfigHelper.getJurisdiction("invalid-region")).toBe(
				JURISDICTIONS.TCFV2,
			);
		});
	});

	describe("getRegion", () => {
		it("should return EU_WEST_1 for TCFV2", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.TCFV2)).toBe(
				AWS_REGIONS.EU_WEST_1,
			);
		});

		it("should return US_WEST_1 for CCPA", () => {
			expect(ConfigHelper.getRegion(JURISDICTIONS.CCPA)).toBe(
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
