import type { JurisdictionOpt } from '../../types';
import { JURISDICTIONS, STAGES } from '../../types';

export class Validator {
	static isStageValid = (value: string): boolean => {
		return Object.values(STAGES).includes(value as STAGES);
	};

	static isStageJurisidiction = (value: JurisdictionOpt): boolean => {
		return Object.values(JURISDICTIONS).includes(value as JURISDICTIONS);
	};
}
