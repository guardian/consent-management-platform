import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { mark } from '../lib/mark';

const init = () => {
	mark('cmp-tcfv2-init');
	initSourcepoint();
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_?.loadPrivacyManagerModal?.(106842);
}

export const TCFv2: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
