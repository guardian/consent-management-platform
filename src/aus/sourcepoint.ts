import { mark } from '../lib/mark';
import { getProperty } from '../lib/property';
import { ACCOUNT_ID, ENDPOINT } from '../lib/sourcepointConfig';
import { invokeCallbacks } from '../onConsentChange';
import { stub } from './stub';

let resolveWillShowPrivacyMessage: typeof Promise.resolve;
export const willShowPrivacyMessage = new Promise<boolean>((resolve) => {
	resolveWillShowPrivacyMessage = resolve as typeof Promise.resolve;
});

// the 'getCustomVendorRejects' option of SP's implementation of __uspapi
// is a custom extension. It hits SP's servers, but unlike the rest of the
// __uspapi, it doesn't implement a queue.
// the only way we can be sure it has become available is to wait for a
// SP event to fire, so we resolve this when we know it has loaded
let resolveSourcepointLibraryLoaded: typeof Promise.resolve;
export const sourcepointLibraryLoaded = new Promise<void>((resolve) => {
	resolveSourcepointLibraryLoaded = resolve as typeof Promise.resolve;
});

// Sets the SP property and custom vendor list
const properties = {
	live: 'https://au.theguardian.com',
	test: 'https://au.theguardian.com',
};

export const init = (pubData = {}): void => {
	stub();

	// invoke callbacks ASAP in AUS
	// TODO this causes an error
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
			baseEndpoint: ENDPOINT,
			accountId: ACCOUNT_ID,
			getDnsMsgMms: true,
			alwaysDisplayDns: false,
			siteHref: getProperty(properties),
			targetingParams: {
				framework: 'aus',
			},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

			events: {
				onConsentReady() {
					mark('cmp-aus-got-consent');

					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},

				onMessageReady: () => {
					mark('cmp-aus-ui-displayed');
				},

				onMessageReceiveData: (data) => {
					void resolveWillShowPrivacyMessage(data.msg_id !== 0);

					// this event always fires, so we can use it announce that the library has loaded
					void resolveSourcepointLibraryLoaded();
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

	const ausLib = document.createElement('script');
	ausLib.id = 'sourcepoint-aus-lib';
	ausLib.src = `${ENDPOINT}/ccpa.js`;
	document.body.appendChild(ausLib);
};
