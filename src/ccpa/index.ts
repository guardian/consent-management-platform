import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { VENDOR_LIST_ID_CCPA } from '../lib/sourcepointConfig';
import { mark } from '../lib/mark';

const init = () => {
	mark('cmp-ccpa-init');
	initSourcepoint();
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_ccpa?.loadPrivacyManagerModal?.(null, VENDOR_LIST_ID_CCPA);
}

export const CCPA: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
