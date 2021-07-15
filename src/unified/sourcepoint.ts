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
	console.log("framework: ", framework)
	window._sp_queue = [];
	window._sp_ = {
		config: {
			baseEndpoint: ENDPOINT,
			accountId: ACCOUNT_ID,
			// propertyHref: getProperty(properties),
			propertyHref:'https://ui-dev',
			targetingParams: {
				"framework": framework,
			},
			ccpa: {
				targetingParams: {
					"framework": 'ccpa',
				},
			},
			gdpr: {
				targetingParams: {
					"framework": 'tcfv2',
				},
			},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

			events: {
				onConsentReady: (message_type, consentUUID, euconsent) => {
					console.log('onConsentReady', message_type);
					console.log('consentUUID', consentUUID)
					console.log('euconsent', euconsent)

					//  TODO rename
					mark('cmp-tcfv2-got-consent');

					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},
				onMessageReady: (message_type) => {
					// Event fires when a message is about to display.
					//  TODO rename
					mark('cmp-tcfv2-ui-displayed');
					console.log('onMessageReady', message_type)
				},

				onMessageReceiveData: (message_type, data) => {
					// Event fires when a message is displayed to the user and sends data about the message and campaign to the callback.
					// The data sent to the callback is in the following structure:
					console.log('onMessageReceiveData', message_type);
					console.log('onMessageReceiveData', data)
					void resolveWillShowPrivacyMessage(data.messageId !== 0);
				},

				onMessageChoiceSelect: (message_type, choice_id, choiceTypeID) => {
					console.log('onMessageChoiceSelect message_type: ', message_type);
					console.log('onMessageChoiceSelect choice_id: ', choice_id);
					console.log('onMessageChoiceSelect choice_type_id: ', choiceTypeID);
					if (
						// https://documentation.sourcepoint.com/web-implementation/sourcepoint-set-up-and-configuration-v2/optional-callbacks#choice-type-id-descriptions
						choiceTypeID === 11 ||
						choiceTypeID === 13 ||
						choiceTypeID === 15
					) {
						setTimeout(invokeCallbacks, 0);
					}
				},
				onPrivacyManagerAction: function (message_type, pmData) {
					console.log('onPrivacyManagerAction message_type:', message_type);
					console.log('onPrivacyManagerAction', pmData)
				},
				onMessageChoiceError: function (message_type, err) {
					console.log('onMessageChoiceError', message_type);
					console.log('onMessageChoiceError', err)
				},
				onPMCancel: function (message_type) {
					console.log('onPMCancel', message_type)
				},
				onSPPMObjectReady: function () {
					 console.log('onSPPMObjectReady')
				},
				onError: function (message_type, errorCode, errorObject, userReset){
					console.log('errorCode: ', message_type);
					console.log('errorCode: ' + errorCode);
					console.log(errorObject);
					console.log('userReset: ' + userReset);
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
