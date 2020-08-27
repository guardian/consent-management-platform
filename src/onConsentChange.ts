/* eslint-disable no-underscore-dangle */
import {
	getConsentState as getCCPAConsentState,
	CCPAConsentState,
} from './ccpa/getConsentState';
import {
	TCFv2ConsentState,
	getConsentState as getTCFv2ConsentState,
} from './tcfv2/getConsentState';

type Callback = (arg0: ConsentState) => void;
type CallbackQueueItem = { fn: Callback; lastState?: string };

export interface ConsentState {
	tcfv2?: TCFv2ConsentState;
	ccpa?: CCPAConsentState;
}

// callbacks cache
const callBackQueue: CallbackQueueItem[] = [];

const invokeCallback = (callback: CallbackQueueItem, state: ConsentState) => {
	const stateString = JSON.stringify(state);

	// only invoke callback if the consent state has changed
	if (stateString !== callback.lastState) {
		callback.fn(state);
		// eslint-disable-next-line no-param-reassign
		callback.lastState = stateString;
	}
};

// invokes all stored callbacks with the current consent state
export const invokeCallbacks = (): void => {
	getConsentState().then((state) => {
		callBackQueue.forEach((callback) => invokeCallback(callback, state));
	});
};

const getConsentState: () => Promise<ConsentState> = async () => {
	if (window.__uspapi) {
		// in USA - https://github.com/InteractiveAdvertisingBureau/USPrivacy/blob/master/CCPA/USP%20API.md
		return { ccpa: await getCCPAConsentState() };
	}

	if (window.__tcfapi) {
		// in RoW - https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md
		return { tcfv2: await getTCFv2ConsentState() };
	}

	throw new Error('no IAB consent framework found on the page');
};

export const onConsentChange = (callBack: Callback): void => {
	const newCallback: CallbackQueueItem = { fn: callBack };

	callBackQueue.push(newCallback);

	// if consentState is already available, invoke callback immediately
	getConsentState()
		.then((consentState) => {
			if (consentState) {
				invokeCallback(newCallback, consentState);
			}
		})
		.catch(() => {
			// do nothing - callback will be added the list anyway and executed when consent changes
		});
};
