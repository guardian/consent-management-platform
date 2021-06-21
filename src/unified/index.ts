import { getCurrentFramework } from '../getCurrentFramework';
import { mark } from '../lib/mark';
import { getProperty } from '../lib/property';
import {
	ACCOUNT_ID,
	ENDPOINT,
	PRIVACY_MANAGER_AUSTRALIA,
	PRIVACY_MANAGER_CCPA,
	PRIVACY_MANAGER_TCFV2,
} from '../lib/sourcepointConfig';
import { invokeCallbacks } from '../onConsentChange';
import type {
	Framework,
	PubData,
	UnifiedSourcepointImplementation,
	WillShowPrivacyMessage,
} from '../types';
import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';

const init = (framework: Framework, pubData?: PubData): void => {
	mark('cmp-init');
	initSourcepoint(framework, pubData);
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	sourcepointWillShowPrivacyMessage;

function showPrivacyManager(): void {
	switch (getCurrentFramework()) {
		case 'tcfv2':
			window._sp_?.gdpr.loadPrivacyManagerModal?.(PRIVACY_MANAGER_TCFV2);
			break;
		case 'ccpa':
			window._sp_?.ccpa.loadPrivacyManagerModal?.(PRIVACY_MANAGER_CCPA);
			break;
		case 'aus':
			window._sp_?.ccpa.loadPrivacyManagerModal?.(
				PRIVACY_MANAGER_AUSTRALIA,
			);
			break;
	}
}

export const UnifiedCMP: UnifiedSourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
