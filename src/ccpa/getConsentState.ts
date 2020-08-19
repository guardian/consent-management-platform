/* eslint-disable no-underscore-dangle */

import { getUSPData } from './api';

export interface CCPAConsentState {
	doNotSell: boolean;
}

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const uspData = await getUSPData();

	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
