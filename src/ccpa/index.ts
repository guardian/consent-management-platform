import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { PRIVACY_MANAGER_CCPA } from '../lib/sourcepointConfig';
import { mark } from '../lib/mark';
import { PubData } from '../types/PubData';
import { WillShowPrivacyMessage } from '../types/WillShowPrivacyMessage';
import { SourcepointImplementation } from '../types/SourcepointImplementation';

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
