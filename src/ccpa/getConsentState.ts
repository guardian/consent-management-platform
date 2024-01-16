import type { CCPAConsentState } from '../types/ccpa';
import { getUSPData } from './api';

// get the current consent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const uspData = await getUSPData();

	// TODO: GET GPP DATA AND COMPARE
	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
