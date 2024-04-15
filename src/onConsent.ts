/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { onConsentChange } from './onConsentChange';
import type { ConsentState } from './types';

/**
 * A promise wrapper around `onConsentChange` that resolves the initial consent state
 *
 * This will only resolve once whereas callbacks passed to `onConsentChange`
 * are executed each time consent state changes. Avoid using this function
 * in contexts where subsequent consent states must be listened for.
 *
 * @returns Promise<ConsentState>
 */
const onConsent = (): Promise<ConsentState> =>
	new Promise<ConsentState>((resolve, reject) => {
		onConsentChange((consentState) => {
			if (consentState.tcfv2 ?? consentState.ccpa ?? consentState.aus) {
				resolve(consentState);
			}
			reject('Unknown framework');
		});
	});

export { onConsent };
