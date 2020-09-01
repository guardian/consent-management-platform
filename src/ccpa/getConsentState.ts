/* eslint-disable no-underscore-dangle */

import { getUSPData } from './api';
import { CCPAConsentState } from './types';

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const uspData = await getUSPData();

	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
