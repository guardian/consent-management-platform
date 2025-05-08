import { AWS_REGIONS, STAGES } from "./constants.js";
import { Validation } from "./validation.js";

describe("Validation Tests", () => {
	describe("isJurisdictionValid", () => {
		it("should throw an error for invalid jurisdiction", () => {
			const invalidJurisdiction = "INVALID_JURISDICTION";
			expect(() =>
				Validation.isJurisdictionValid(invalidJurisdiction),
			).toThrow(`Invalid jurisdiction: ${invalidJurisdiction}`);
		});

		it("should return true for valid jurisdiction", () => {
			const validJurisdiction = "tcfv2";
			expect(Validation.isJurisdictionValid(validJurisdiction)).toBe(
				true,
			);
		});
	});

	describe("isRegionValid", () => {
		it("should throw an error for invalid region", () => {
			const invalidRegion = "INVALID_REGION";
			expect(() => Validation.isRegionValid(invalidRegion)).toThrow(
				`Invalid region: ${invalidRegion}`,
			);
		});

		it("should return true for valid region", () => {
			const validRegion = "eu-west-1";
			expect(Validation.isRegionValid(validRegion)).toBe(true);
		});
	});

	describe("isStageValid", () => {
		it("should throw an error for invalid stage", () => {
			const invalidStage = "INVALID_STAGE";
			expect(() => Validation.isStageValid(invalidStage)).toThrow(
				`Invalid stage: ${invalidStage}`,
			);
		});

		it("should return true for valid stage", () => {
			const validStage = STAGES.CODE;
			expect(Validation.isStageValid(validStage)).toBe(true);
		});
	});

	describe("hasCorrectEnvironmentVariables", () => {
		beforeEach(() => {
			process.env.region = AWS_REGIONS.EU_WEST_1;
			process.env.stage = STAGES.CODE;
		});

		it("should throw an error for missing environment variables", () => {
			delete process.env.region;
			expect(() => Validation.hasCorrectEnvironmentVariables()).toThrow(
				"Missing environment variable: region",
			);
		});

		it("should throw an error for invalid region", () => {
			process.env.region = "INVALID_REGION";
			expect(() => Validation.hasCorrectEnvironmentVariables()).toThrow(
				`Invalid region: ${process.env.region.toLowerCase()}`,
			);
		});

		it("should throw an error for invalid stage", () => {
			process.env.stage = "INVALID_STAGE";
			expect(() => Validation.hasCorrectEnvironmentVariables()).toThrow(
				`Invalid stage: ${process.env.stage.toLowerCase()}`,
			);
		});

		it("should not throw an error for valid environment variables", () => {
			expect(() =>
				Validation.hasCorrectEnvironmentVariables(),
			).not.toThrow();
		});
	});
});
