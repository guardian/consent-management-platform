/* eslint-disable no-underscore-dangle */

import stub from '@iabtcf/stub';
import { mark } from '../lib/mark';
import { ACCOUNT_ID } from '../lib/accountId';
import { isGuardianDomain } from '../lib/domain';
import { invokeCallbacks } from '../onConsent';

let resolveWillShowPrivacyMessage: Function | undefined;
export const willShowPrivacyMessage = new Promise<boolean>((resolve) => {
	resolveWillShowPrivacyMessage = resolve;
});

export const init = () => {
	stub();

	// // make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_) {
		throw new Error('Sourcepoint TCF global (window._sp_) is already defined!');
	}

	window._sp_ = {
		config: {
			mmsDomain: 'https://consent.theguardian.com',
			wrapperAPIOrigin: 'https://wrapper-api.sp-prod.net/tcfv2',
			accountId: ACCOUNT_ID,
			propertyHref: isGuardianDomain() ? null : 'https://test.theguardian.com',

			events: {
				onConsentReady() {
					mark('cmp-tcfv2-got-consent');
					invokeCallbacks();
				},
				onMessageReady: () => {
					mark('cmp-tcfv2-ui-displayed');
				},
				onMessageReceiveData: (data) => {
					resolveWillShowPrivacyMessage?.(data.msg_id !== 0);
				},
			},
		},
	};

	const tcfLib = document.createElement('script');
	tcfLib.id = 'sourcepoint-ccpa-lib';
	tcfLib.src = 'https://ccpa.sp-prod.net/ccpa.js';

	document.body.appendChild(tcfLib);
};
