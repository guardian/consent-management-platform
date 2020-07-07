import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { mark } from '../lib/mark';

const init = () => {
	mark('cmp-ccpa-init');
	initSourcepoint();
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_ccpa?.loadPrivacyManagerModal?.(null, '5ed10d99c3b12e4c1052efca');
}

export const CCPA: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
