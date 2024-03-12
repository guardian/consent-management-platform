import type { CCPAConsentState } from '../types/ccpa';
import { getGPPData, getUSPData } from './api';

// get the current consent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const gppData = await getGPPData()

	if(gppData.parsedSections && gppData.applicableSections.length > 0 && gppData.applicableSections.includes(7)) {
		return {
			doNotSell: gppData.parsedSections.usnatv1.SaleOptOut !== 2
		}
	}

	const uspData = await getUSPData();

	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
