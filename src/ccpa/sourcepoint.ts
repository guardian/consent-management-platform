import { mark } from '../lib/mark';
import { getProperty } from '../lib/property';
import { ACCOUNT_ID, ENDPOINT } from '../lib/sourcepointConfig';
import { invokeCallbacks } from '../onConsentChange';
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

export const init = (pubData = {}): void => {
	stub();

	// make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_ccpa) {
		throw new Error(
			'Sourcepoint CCPA global (window._sp_ccpa) is already defined!',
		);
	}

	// invoke callbacks before we receive Sourcepoint events
	setTimeout(invokeCallbacks, 0);

	/* istanbul ignore next */
	window._sp_ccpa = {
		config: {
			baseEndpoint: ENDPOINT,
			accountId: ACCOUNT_ID,
			getDnsMsgMms: true,
			alwaysDisplayDns: false,
			siteHref: getProperty(properties),
			targetingParams: {
				framework: 'ccpa',
			},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

			events: {
				onConsentReady() {
					mark('cmp-ccpa-got-consent');
				},

				onMessageReady: () => {
					mark('cmp-ccpa-ui-displayed');
				},

				onMessageReceiveData: (data) => {
					void resolveWillShowPrivacyMessage(data.msg_id !== 0);
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
	ccpaLib.src = `${ENDPOINT}/ccpa.js`;
	document.body.appendChild(ccpaLib);
};
