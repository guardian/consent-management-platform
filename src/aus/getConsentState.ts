import type { AUSConsentState } from '../types/aus';
import { getUSPData } from './api';

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<AUSConsentState> = async () => {
	const uspData = await getUSPData();

	return {
		personalisedAdvertising: uspData.uspString.charAt(2) === 'Y',
	};
};
