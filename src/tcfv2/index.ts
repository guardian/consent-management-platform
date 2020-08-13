import {
	init as initSourcepoint,
	willShowPrivacyMessage as sourcepointWillShowPrivacyMessage,
} from './sourcepoint';
import { PRIVACY_MANAGER_TCFV2 } from '../lib/sourcepointConfig';
import { mark } from '../lib/mark';
import { PubData, SourcepointImplementation } from '../types';

const init = (pubData?: PubData) => {
	mark('cmp-tcfv2-init');
	initSourcepoint(pubData);
};

const willShowPrivacyMessage = () => sourcepointWillShowPrivacyMessage;

function showPrivacyManager() {
	// eslint-disable-next-line no-underscore-dangle
	window._sp_?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_TCFV2);
}

export const TCFv2: SourcepointImplementation = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
};
