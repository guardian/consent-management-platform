import { log } from '@guardian/libs';
import { setCurrentFramework } from '../getCurrentFramework';
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
	stub();

	// // make sure nothing else on the page has accidentally
	// used the _sp_* name as well
	if (window._sp_) {
		throw new Error('Sourcepoint global (window._sp_) is already defined!');
	}

	setCurrentFramework(framework);

	// invoke callbacks before we receive Sourcepoint events
	invokeCallbacks();

	const targetingParamFramework: Framework =
		framework == 'tcfv2' ? framework : 'ccpa';
	const messageTypeFramework: string = framework == 'tcfv2' ? 'gdpr' : 'ccpa';

	log('cmp', `framework: ${framework}`);
	log('cmp', `targetingParamFramework: ${targetingParamFramework}`);
	log('cmp', `messageTypeFramework: ${messageTypeFramework}`);
	window._sp_queue = [];
	/* istanbul ignore next */
	window._sp_ = {
		config: {
			baseEndpoint: ENDPOINT,
			accountId: ACCOUNT_ID,
			// propertyHref: getProperty(properties),
			propertyHref:'https://ui-dev',
			targetingParams: {
				framework: targetingParamFramework,
			},
			ccpa: {},
			gdpr: {},

			pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },

			events: {
				onConsentReady: (message_type, consentUUID, euconsent) => {
					log('cmp', `onConsentReady ${message_type}`);
					if (message_type != messageTypeFramework) return;

					log('cmp', `consentUUID ${consentUUID}`);
					log('cmp', `euconsent ${euconsent}`);

					//  TODO rename
					mark('cmp-tcfv2-got-consent');

					// onConsentReady is triggered before SP update the consent settings :(
					setTimeout(invokeCallbacks, 0);
				},
				onMessageReady: (message_type) => {
					log('cmp', `onMessageReady ${message_type}`);
					if (message_type != messageTypeFramework) return;

					// Event fires when a message is about to display.
					//  TODO rename
					mark('cmp-tcfv2-ui-displayed');
				},

				onMessageReceiveData: (message_type, data) => {
					// Event fires when a message is displayed to the user and sends data about the message and campaign to the callback.
					// The data sent to the callback is in the following structure:
					log('cmp', `onMessageReceiveData ${message_type}`);
					if (message_type != messageTypeFramework) return;

					log('cmp', 'onMessageReceiveData ', data);
					void resolveWillShowPrivacyMessage(data.messageId !== 0);
				},

				onMessageChoiceSelect: (
					message_type,
					choice_id,
					choiceTypeID,
				) => {
					log(
						'cmp',
						`onMessageChoiceSelect message_type: ${message_type}`,
					);
					console.log();
					if (message_type != messageTypeFramework) return;

					log('cmp', `onMessageChoiceSelect choice_id: ${choice_id}`);
					log(
						'cmp',
						`onMessageChoiceSelect choice_type_id: ${choiceTypeID}`,
					);
					if (
						// https://documentation.sourcepoint.com/web-implementation/web-implementation/multi-campaign-web-implementation/event-callbacks#choice-type-id-descriptions
						choiceTypeID === 11 ||
						choiceTypeID === 13 ||
						choiceTypeID === 15
					) {
						setTimeout(invokeCallbacks, 0);
					}
				},
				onPrivacyManagerAction: function (message_type, pmData) {
					log(
						'cmp',
						`onPrivacyManagerAction message_type: ${message_type}`,
					);
					if (message_type != messageTypeFramework) return;

					log('cmp', `onPrivacyManagerAction ${pmData}`);
				},
				onMessageChoiceError: function (message_type, err) {
					log('cmp', `onMessageChoiceError ${message_type}`);
					if (message_type != messageTypeFramework) return;

					log('cmp', `onMessageChoiceError ${err}`);
				},
				onPMCancel: function (message_type) {
					log('cmp', `onPMCancel ${message_type}`);
					if (message_type != messageTypeFramework) return;
				},
				onSPPMObjectReady: function () {
					log('cmp', 'onSPPMObjectReady');
				},
				onError: function (
					message_type,
					errorCode,
					errorObject,
					userReset,
				) {
					log('cmp', `errorCode: ${message_type}`);
					if (message_type != messageTypeFramework) return;

					log('cmp', `errorCode: ${errorCode}`);
					log('cmp', errorObject);
					log('cmp', `userReset: ${userReset}`);
				},
			},
		},
	};

	if (framework === 'tcfv2') {
		window._sp_.config.gdpr.targetingParams = {
			framework: targetingParamFramework,
		};
	} else {
		window._sp_.config.ccpa.targetingParams = {
			framework: targetingParamFramework,
		};
	}

	const spLib = document.createElement('script');
	spLib.id = 'sourcepoint-lib';
	// TODO put this file in place!
	spLib.src = `${ENDPOINT}/unified/wrapperMessagingWithoutDetection.js`;

	document.body.appendChild(spLib);
};
