import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { mark } from '../lib/mark';

const VENDOR_LIST_ID = '5eba7ef78c167c47ca8b433d';

const init = () => {
	mark('cmp-ccpa-init');
	initSourcepoint();
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_ccpa?.loadPrivacyManagerModal?.(null, VENDOR_LIST_ID);
}

export const CCPA: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
