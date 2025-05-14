import { AWS_REGIONS, JURISDICTIONS, STAGES } from "../constants";
import { ConfigWrapper } from "./config-wrapper";

describe("ConfigWrapper", () => {
	describe("generateConfig", () => {
		it("should generate config for scheduled run", () => {
			const configWrapper = new ConfigWrapper(
				AWS_REGIONS.EU_WEST_1,
				STAGES.CODE,
				null,
			);
			configWrapper.generateConfig();
			expect(configWrapper.config).toBeDefined();
			expect(configWrapper.isRunningAdhoc).toBe(false);
		});

		it("should generate config for ad-hoc run", () => {
			const configWrapper = new ConfigWrapper(
				null,
				STAGES.CODE,
				JURISDICTIONS.TCFV2,
			);
			configWrapper.generateConfig();
			expect(configWrapper.config).toBeDefined();
			expect(configWrapper.isRunningAdhoc).toBe(true);
		});
	});
});
