/* eslint-disable no-underscore-dangle */

import stub from '@iabtcf/stub';
import { mark } from '../lib/mark';
import { ACCOUNT_ID } from '../lib/accountId';
import { isGuardianDomain } from '../lib/domain';
import { invokeCallbacks } from '../onConsentChange';

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
			targetingParams: {
				framework: 'tcfv2',
			},

			events: {
				onConsentReady() {
					mark('cmp-tcfv2-got-consent');
					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},
				onMessageReady: () => {
					mark('cmp-tcfv2-ui-displayed');
				},
				onMessageReceiveData: (data) => {
					resolveWillShowPrivacyMessage?.(data.messageId !== 0);
				},
				onMessageChoiceSelect: (_choiceId, choiceTypeID) => {
					if (
						// https://documentation.sourcepoint.com/web-implementation/sourcepoint-set-up-and-configuration-v2/optional-callbacks#choice-type-id-descriptions
						choiceTypeID === 11 ||
						choiceTypeID === 13 ||
						choiceTypeID === 15
					) {
						setTimeout(invokeCallbacks, 0);
					}
				},
			},
		},
	};

	const tcfLib = document.createElement('script');
	tcfLib.id = 'sourcepoint-tcfv2-lib';
	tcfLib.src =
		'https://gdpr-tcfv2.sp-prod.net/wrapperMessagingWithoutDetection.js';

	document.body.appendChild(tcfLib);
};
