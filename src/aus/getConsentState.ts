/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import type { AUSConsentState } from '../types/aus';
import { getUSPData } from './api';

// get the current consent state using the official IAB method
export const getConsentState: () => Promise<AUSConsentState> = async () => {
	const uspData = await getUSPData();

	// https://github.com/InteractiveAdvertisingBureau/CCPA-reference-code
	const optedOut = uspData.uspString.charAt(2) === 'Y';

	return {
		personalisedAdvertising: !optedOut,
	};
};
