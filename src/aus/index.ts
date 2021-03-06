import { mark } from '../lib/mark';
import { PRIVACY_MANAGER_AUSTRALIA } from '../lib/sourcepointConfig';
import type {
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from '../types';
import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';

const init = (pubData?: PubData): void => {
	mark('cmp-aus-init');
	initSourcepoint(pubData);
};

/* istanbul ignore-next */
const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	sourcepointWillShowPrivacyMessage;

function showPrivacyManager(): void {
	window._sp_ccpa?.loadPrivacyManagerModal?.(null, PRIVACY_MANAGER_AUSTRALIA);
}

export const AUS: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
