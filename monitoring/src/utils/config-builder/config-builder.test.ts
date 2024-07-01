import { STAGES } from '../../types.ts';
import {
	ConfigArticleUrl,
	ConfigBuilder,
	ConfigFrontUrl,
	IframeDomainUrl,
	IframeDomainUrlSecondLayer,
} from './config-builder';

describe('ConfigBuilder', () => {
	describe('getFrontUrl', () => {
		it('should return the string ConfigFrontUrl.PROD if the Prod stage is passed', () => {
			const response = ConfigBuilder.getFrontUrl(STAGES.PROD);
			expect(response).toBe(ConfigFrontUrl.PROD);
		});

		it('should return the string ConfigFrontUrl.CODE if the Code stage is passed', () => {
			const response = ConfigBuilder.getFrontUrl(STAGES.CODE);
			expect(response).toBe(ConfigFrontUrl.CODE);
		});

		it('should return the string ConfigFrontUrl.LOCAL if the Local stage is passed', () => {
			const response = ConfigBuilder.getFrontUrl(STAGES.LOCAL);
			expect(response).toBe(ConfigFrontUrl.LOCAL);
		});
	});

	describe('getArticleUrl', () => {
		it('should return the string ConfigArticleUrl.PROD if the Prod stage is passed', () => {
			const response = ConfigBuilder.getArticleUrl(STAGES.PROD);
			expect(response).toBe(ConfigArticleUrl.PROD);
		});

		it('should return the string ConfigArticleUrl.CODE if the Code stage is passed', () => {
			const response = ConfigBuilder.getArticleUrl(STAGES.CODE);
			expect(response).toBe(ConfigArticleUrl.CODE);
		});

		it('should return the string ConfigArticleUrl.LOCAL if the Local stage is passed', () => {
			const response = ConfigBuilder.getArticleUrl(STAGES.LOCAL);
			expect(response).toBe(ConfigArticleUrl.LOCAL);
		});
	});

	describe('getIframeDomain', () => {
		it('should return the string IframeDomainUrl.PROD if the Prod stage is passed', () => {
			const response = ConfigBuilder.getIframeDomain(STAGES.PROD);
			expect(response).toBe(IframeDomainUrl.PROD);
		});

		it('should return the string IframeDomainUrl.CODE if the Code stage is passed', () => {
			const response = ConfigBuilder.getIframeDomain(STAGES.CODE);
			expect(response).toBe(IframeDomainUrl.CODE);
		});

		it('should return the string IframeDomainUrl.LOCAL if the Local stage is passed', () => {
			const response = ConfigBuilder.getIframeDomain(STAGES.LOCAL);
			expect(response).toBe(IframeDomainUrl.LOCAL);
		});
	});

	describe('getIframeDomainSecondLayer', () => {
		it('should return the string IframeDomainUrl.PROD if the Prod stage is passed', () => {
			const response = ConfigBuilder.getIframeDomainSecondLayer(
				STAGES.PROD,
			);
			expect(response).toBe(IframeDomainUrlSecondLayer.PROD);
		});

		it('should return the string IframeDomainUrl.CODE if the Code stage is passed', () => {
			const response = ConfigBuilder.getIframeDomainSecondLayer(
				STAGES.CODE,
			);
			expect(response).toBe(IframeDomainUrlSecondLayer.CODE);
		});

		it('should return the string IframeDomainUrl.LOCAL if the Local stage is passed', () => {
			const response = ConfigBuilder.getIframeDomainSecondLayer(
				STAGES.LOCAL,
			);
			expect(response).toBe(IframeDomainUrlSecondLayer.LOCAL);
		});
	});
});
