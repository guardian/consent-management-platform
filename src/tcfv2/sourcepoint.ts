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

	// // make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_) {
		throw new Error(
			'Sourcepoint TCF global (window._sp_) is already defined!',
		);
	}

	/* istanbul ignore next */
	window._sp_ = {
		config: {
			baseEndpoint: 'https://sourcepoint.theguardian.com',
			accountId: ACCOUNT_ID,
			propertyHref: isGuardianDomain()
				? null
				: 'https://test.theguardian.com',
			targetingParams: {
				framework: 'tcfv2',
			},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

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

	const tcfLib = document.createElement('script');
	tcfLib.id = 'sourcepoint-tcfv2-lib';
	tcfLib.src =
		'https://sourcepoint.theguardian.com/wrapperMessagingWithoutDetection.js';

	document.body.appendChild(tcfLib);
};
