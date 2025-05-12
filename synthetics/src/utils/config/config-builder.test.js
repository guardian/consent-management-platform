import { AWS_REGIONS, JURISDICTIONS, STAGES } from "../constants";
import {
	ConfigAMPArticleURl,
	ConfigArticleUrl,
	ConfigBuilder,
	ConfigFrontUrl,
	IframeDomainUrl,
	IframeDomainUrlSecondLayer,
} from "./config-builder";

describe("ConfigBuilder", () => {
	describe("construct", () => {
		it("should construct the config object with the correct values", () => {
			const stage = STAGES.CODE;
			const jurisdiction = "TCFV2";
			const region = "EU_WEST_1";
			const isRunningAdhoc = false;

			const config = ConfigBuilder.construct(
				stage,
				jurisdiction,
				region,
				isRunningAdhoc,
			);

			expect(config).toEqual({
				stage: stage,
				jurisdiction: jurisdiction,
				region: region,
				isRunningAdhoc: isRunningAdhoc,
				debugMode: false,
				frontUrl: ConfigFrontUrl.CODE,
				articleUrl: ConfigArticleUrl.CODE,
				ampArticle: ConfigAMPArticleURl.CODE,
				iframeDomainUrl: IframeDomainUrl.CODE,
				iframeDomainUrlSecondLayer: IframeDomainUrlSecondLayer.CODE,
				checkFunction: expect.any(Function),
			});
		});
	});

	describe("getFrontUrl", () => {
		it("should return the correct front URL for each stage", () => {
			expect(ConfigBuilder.getFrontUrl(STAGES.PROD)).toBe(
				ConfigFrontUrl.PROD,
			);
			expect(ConfigBuilder.getFrontUrl(STAGES.CODE)).toBe(
				ConfigFrontUrl.CODE,
			);
			expect(ConfigBuilder.getFrontUrl(STAGES.LOCAL)).toBe(
				ConfigFrontUrl.LOCAL,
			);
			expect(ConfigBuilder.getFrontUrl("INVALID_STAGE")).toBe(
				ConfigFrontUrl.CODE,
			);
		});
	});

	describe("getArticleUrl", () => {
		it("should return the correct article URL for each stage", () => {
			expect(ConfigBuilder.getArticleUrl(STAGES.PROD)).toBe(
				ConfigArticleUrl.PROD,
			);
			expect(ConfigBuilder.getArticleUrl(STAGES.CODE)).toBe(
				ConfigArticleUrl.CODE,
			);
			expect(ConfigBuilder.getArticleUrl(STAGES.LOCAL)).toBe(
				ConfigArticleUrl.LOCAL,
			);
			expect(ConfigBuilder.getArticleUrl("INVALID_STAGE")).toBe(
				ConfigArticleUrl.CODE,
			);
		});
	});
	describe("getAMPArticleUrl", () => {
		it("should return the correct AMP article URL for each stage", () => {
			expect(ConfigBuilder.getAMPArticleUrl(STAGES.PROD)).toBe(
				ConfigAMPArticleURl.PROD,
			);
			expect(ConfigBuilder.getAMPArticleUrl(STAGES.CODE)).toBe(
				ConfigAMPArticleURl.CODE,
			);
			expect(ConfigBuilder.getAMPArticleUrl(STAGES.LOCAL)).toBe(
				ConfigAMPArticleURl.LOCAL,
			);
			expect(ConfigBuilder.getAMPArticleUrl("INVALID_STAGE")).toBe(
				ConfigAMPArticleURl.CODE,
			);
		});
	});
	describe("getIframeDomainUrl", () => {
		it("should return the correct iframe domain URL for each stage", () => {
			expect(ConfigBuilder.getIframeDomainUrl(STAGES.PROD)).toBe(
				IframeDomainUrl.PROD,
			);
			expect(ConfigBuilder.getIframeDomainUrl(STAGES.CODE)).toBe(
				IframeDomainUrl.CODE,
			);
			expect(ConfigBuilder.getIframeDomainUrl(STAGES.LOCAL)).toBe(
				IframeDomainUrl.LOCAL,
			);
			expect(ConfigBuilder.getIframeDomainUrl("INVALID_STAGE")).toBe(
				IframeDomainUrl.CODE,
			);
		});
	});
	describe("getIframeDomainUrlSecondLayer", () => {
		it("should return the correct iframe domain URL for each stage", () => {
			expect(
				ConfigBuilder.getIframeDomainUrlSecondLayer(STAGES.PROD),
			).toBe(IframeDomainUrlSecondLayer.PROD);
			expect(
				ConfigBuilder.getIframeDomainUrlSecondLayer(STAGES.CODE),
			).toBe(IframeDomainUrlSecondLayer.CODE);
			expect(
				ConfigBuilder.getIframeDomainUrlSecondLayer(STAGES.LOCAL),
			).toBe(IframeDomainUrlSecondLayer.LOCAL);
			expect(
				ConfigBuilder.getIframeDomainUrlSecondLayer("INVALID_STAGE"),
			).toBe(IframeDomainUrlSecondLayer.CODE);
		});
	});

	describe("isRunningAdhoc", () => {
		it("should return the correct isRunningAdhoc value", () => {
			const config = ConfigBuilder.construct(
				STAGES.CODE,
				JURISDICTIONS.TCFV2,
				AWS_REGIONS.EU_WEST_1,
				true,
			);
			expect(config.isRunningAdhoc).toBe(true);
		});

		it("should return the correct isRunningAdhoc value", () => {
			const config = ConfigBuilder.construct(
				STAGES.CODE,
				JURISDICTIONS.TCFV2,
				AWS_REGIONS.EU_WEST_1,
				false,
			);
			expect(config.isRunningAdhoc).toBe(false);
		});
	});
});
