import { JURISDICTIONS, STAGES } from '../../types';
import { Validator } from './validator';

describe('Monitoring Validator', () => {
	describe('isStageValid', () => {
		it('should return false if a stage that does not exist within the STAGES enum is passed', () => {
			const response: boolean = Validator.isStageValid('doesnotexist');
			expect(response).toBe(false);
		});

		it('should return true if a stage that exists within the STAGES enum is passed', () => {
			const response: boolean = Validator.isStageValid(STAGES.CODE);
			expect(response).toBe(true);
		});
	});

	describe('isStageJurisdiction', () => {
		it('should return false if a stage that does not exist within the JURISDICTIONS enum is passed', () => {
			const response: boolean =
				Validator.isStageJurisdiction('doesnotexist');
			expect(response).toBe(false);
		});

		it('should return true if a jurisdiction that exists within the JURISDICTIONS enum is passed', () => {
			const response: boolean = Validator.isStageJurisdiction(
				JURISDICTIONS.CCPA,
			);
			expect(response).toBe(true);
		});
	});
});
