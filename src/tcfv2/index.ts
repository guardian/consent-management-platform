import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { mark } from '../lib/mark';

const SOURCEPOINT_CMP_ID = 106842;

const init = () => {
	mark('cmp-tcfv2-init');
	initSourcepoint();
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_?.loadPrivacyManagerModal?.(SOURCEPOINT_CMP_ID);
}

export const TCFv2: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
