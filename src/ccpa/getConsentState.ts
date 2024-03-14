import type { CCPAConsentState } from '../types/ccpa';
import { getGPPData } from './api';

// get the current consent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const gppData = await getGPPData();

	if (
		gppData.parsedSections &&
		gppData.applicableSections.length > 0 &&
		gppData.applicableSections.includes(7)
	) {
		console.log('GPP DATA', gppData);
		console.log(
			'doNotSell',
			gppData.parsedSections.usnatv1.SaleOptOut !== 2,
		);
	}
	return {
		doNotSell: gppData.parsedSections
			? gppData.parsedSections.usnatv1.SaleOptOut !== 2
			: true,
	};
};
