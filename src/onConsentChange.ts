import { getConsentState as getAUSConsentState } from './aus/getConsentState';
import { getConsentState as getCCPAConsentState } from './ccpa/getConsentState';
import { getCurrentFramework } from './getCurrentFramework';
import { getConsentState as getTCFv2ConsentState } from './tcfv2/getConsentState';
import type { Callback, CallbackQueueItem, ConsentState } from './types';

// callbacks cache
const callBackQueue: CallbackQueueItem[] = [];

const invokeCallback = (callback: CallbackQueueItem, state: ConsentState) => {
	const stateString = JSON.stringify(state);

	// only invoke callback if the consent state has changed
	if (stateString !== callback.lastState) {
		callback.fn(state);
		callback.lastState = stateString;
	}
};

const getConsentState: () => Promise<ConsentState> = async () => {
	// if (window.__uspapi) {
	// 	// in USA or AUS - https://git.io/JUOdq
	// 	if (getCurrentFramework() === 'aus')
	// 		return { aus: await getAUSConsentState() };

	// 	return { ccpa: await getCCPAConsentState() };
	// }

	// if (window.__tcfapi) {
	// 	// in RoW - https://git.io/JfrZr
	// 	return { tcfv2: await getTCFv2ConsentState() };
	// }

	// throw new Error('no IAB consent framework found on the page');

	switch (getCurrentFramework()) {
		case 'aus':
			return { aus: await getAUSConsentState() };
		case 'ccpa':
			return { ccpa: await getCCPAConsentState() };
		case 'tcfv2':
			return { tcfv2: await getTCFv2ConsentState() };
		default:
			throw new Error('no IAB consent framework found on the page');
	}
};

// invokes all stored callbacks with the current consent state
export const invokeCallbacks = (): void => {
	void getConsentState().then((state) => {
		callBackQueue.forEach((callback) => invokeCallback(callback, state));
	});
};

export const onConsentChange: (fn: Callback) => void = (callBack) => {
	const newCallback: CallbackQueueItem = { fn: callBack };

	callBackQueue.push(newCallback);

	// if consentState is already available, invoke callback immediately
	getConsentState()
		.then((consentState) => {
			invokeCallback(newCallback, consentState);
		})
		/* istanbul ignore next */
		.catch(() => {
			// do nothing - callback will be added the list anyway and executed when consent changes
		});
};

export const _ = { getConsentState };
