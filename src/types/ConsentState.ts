import { CCPAConsentState } from '../ccpa/types/CCPAConsentState';
import { TCFv2ConsentState } from '../tcfv2/types/TCFv2ConsentState';

export interface ConsentState {
	tcfv2?: TCFv2ConsentState;
	ccpa?: CCPAConsentState;
}
