import type { CCPAConsentState } from '../types/ccpa';
import { getGPPData, getUSPData } from './api';

// get the current consent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const uspData = await getUSPData();
	const gppData = await getGPPData();


	// TODO: GET GPP DATA AND COMPARE
	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
