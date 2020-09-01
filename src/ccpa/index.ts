import { mark } from '../lib/mark';
import { PRIVACY_MANAGER_CCPA } from '../lib/sourcepointConfig';
import {
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from '../types';
import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';

const init = (pubData?: PubData): void => {
	mark('cmp-ccpa-init');
	initSourcepoint(pubData);
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	sourcepointWillShowPrivacyMessage;

function showPrivacyManager(): void {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_ccpa?.loadPrivacyManagerModal?.(null, PRIVACY_MANAGER_CCPA);
}

export const CCPA: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
