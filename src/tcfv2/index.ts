import { mark } from '../lib/mark';
import { PRIVACY_MANAGER_TCFV2 } from '../lib/sourcepointConfig';
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
	mark('cmp-tcfv2-init');
	initSourcepoint(pubData);
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	sourcepointWillShowPrivacyMessage;

function showPrivacyManager(): void {
	window._sp_?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_TCFV2);
}

export const TCFv2: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
