import { mark } from '../lib/mark';
import { getProperty } from '../lib/property';
import { ACCOUNT_ID, ENDPOINT } from '../lib/sourcepointConfig';
import { invokeCallbacks } from '../onConsentChange';
import type { Framework } from '../types';
import { stub } from './stub';

let resolveWillShowPrivacyMessage: typeof Promise.resolve;
export const willShowPrivacyMessage = new Promise<boolean>((resolve) => {
	resolveWillShowPrivacyMessage = resolve as typeof Promise.resolve;
});

// Sets the SP property and custom vendor list
const properties = {
	live: null, // whichever *.theguardian.com subdomain the page is served on
	test: 'https://test.theguardian.com',
};

export const init = (framework: Framework, pubData = {}): void => {
	stub(framework);

	// // make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_) {
		throw new Error(
			'Sourcepoint TCF global (window._sp_) is already defined!',
		);
	}

	// invoke callbacks before we receive Sourcepoint events
	invokeCallbacks();

	/* istanbul ignore next */
	window._sp_ = {
		config: {
			baseEndpoint: ENDPOINT,
			accountId: ACCOUNT_ID,
			propertyHref: getProperty(properties),
			ccpa: {
				targetingParams: {
					framework: 'ccpa',
				},
			},
			gdpr: {
				targetingParams: {
					framework: 'tcfv2',
				},
			},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

			events: {
				onConsentReady: () => {
					//  TODO rename
					mark('cmp-tcfv2-got-consent');

					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},

				onMessageReady: () => {
					//  TODO rename
					mark('cmp-tcfv2-ui-displayed');
				},

				onMessageReceiveData: (data) => {
					void resolveWillShowPrivacyMessage(data.messageId !== 0);
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

	const spLib = document.createElement('script');
	spLib.id = 'sourcepoint-lib';
	// TODO put this file in place!
	spLib.src = `${ENDPOINT}/unified/wrapperMessagingWithoutDetection.js`;

	document.body.appendChild(spLib);
};
