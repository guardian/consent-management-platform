/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { isServerSide } from '../server';

let isGuardian: boolean | undefined;

export const isGuardianDomain = (): boolean => {
	if (typeof isGuardian === 'undefined') {
		// If this code is running server-side set isGuardian to a sensible default
		if (isServerSide) {
			isGuardian = true;
		} else {
			isGuardian = window.location.host.endsWith('.theguardian.com');
		}
	}

	return isGuardian;
};
