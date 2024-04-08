/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { isServerSide } from '../server';

/**
 * Determines whether the JavaScript GPC signal is present
 * https://globalprivacycontrol.github.io/gpc-spec/#javascript-property-to-detect-preference
 *
 * @returns boolean | undefined
 */

export const getGpcSignal = (): boolean | undefined => {
	return isServerSide ? undefined : navigator.globalPrivacyControl;
};
