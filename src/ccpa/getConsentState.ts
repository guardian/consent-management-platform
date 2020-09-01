/* eslint-disable no-underscore-dangle */

import { CCPAConsentState } from '../types/ccpa';
import { getUSPData } from './api';

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<CCPAConsentState> = async () => {
	const uspData = await getUSPData();

	return {
		doNotSell: uspData.uspString.charAt(2) === 'Y',
	};
};
