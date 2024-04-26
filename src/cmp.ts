/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { getCurrentFramework } from './getCurrentFramework';
import { mark } from './lib/mark';
import {
	PRIVACY_MANAGER_AUSTRALIA,
	PRIVACY_MANAGER_CCPA,
	PRIVACY_MANAGER_TCFV2,
} from './lib/sourcepointConfig';
import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import type {
	Framework,
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from './types';

const init = (framework: Framework, pubData?: PubData): void => {
	mark('cmp-init');
	initSourcepoint(framework, pubData);
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	sourcepointWillShowPrivacyMessage;

function showPrivacyManager(): void {
	switch (getCurrentFramework()) {
		case 'tcfv2':
			window._sp_?.gdpr?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_TCFV2);
			break;
		case 'ccpa':
			window._sp_?.ccpa?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_CCPA);
			break;
		case 'aus':
			window._sp_?.ccpa?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_AUSTRALIA);
			break;
	}
}

export const CMP: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
