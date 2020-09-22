/* eslint-disable no-underscore-dangle */

import { isGuardianDomain } from '../lib/domain';
import { mark } from '../lib/mark';
import { ACCOUNT_ID } from '../lib/sourcepointConfig';
import { invokeCallbacks } from '../onConsentChange';
import { stub } from './stub';

let resolveWillShowPrivacyMessage: typeof Promise.resolve;
export const willShowPrivacyMessage = new Promise<boolean>((resolve) => {
	resolveWillShowPrivacyMessage = resolve as typeof Promise.resolve;
});

export const init = (pubData = {}): void => {
	stub();

	// invoke callbacks ASAP in USA
	invokeCallbacks();

	// make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_ccpa) {
		throw new Error(
			'Sourcepoint CCPA global (window._sp_ccpa) is already defined!',
		);
	}

	/* istanbul ignore next */
	window._sp_ccpa = {
		config: {
			mmsDomain: 'https://sourcepoint.theguardian.com',
			ccpaOrigin: 'https://ccpa-service.sp-prod.net',
			accountId: ACCOUNT_ID,
			getDnsMsgMms: true,
			alwaysDisplayDns: false,
			siteHref: isGuardianDomain() ? null : 'https://test.theguardian.com',
			targetingParams: {
				framework: 'ccpa',
			},

			pubData,

			events: {
				onConsentReady() {
					mark('cmp-ccpa-got-consent');
					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},

				onMessageReady: () => {
					mark('cmp-ccpa-ui-displayed');
				},

				onMessageReceiveData: (data) => {
					resolveWillShowPrivacyMessage?.(data.msg_id !== 0);
				},

				onMessageChoiceSelect: (_, choiceTypeID) => {
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

	const ccpaLib = document.createElement('script');
	ccpaLib.id = 'sourcepoint-ccpa-lib';
	ccpaLib.src = 'https://sourcepoint.theguardian.com/ccpa.js';
	document.body.appendChild(ccpaLib);
};
