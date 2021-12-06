import { getConsentState as getAUSConsentState } from './aus/getConsentState';
import { getConsentState as getCCPAConsentState } from './ccpa/getConsentState';
import { getCurrentFramework } from './getCurrentFramework';
import { getConsentState as getTCFv2ConsentState } from './tcfv2/getConsentState';
import type { Callback, CallbackQueueItem, ConsentState } from './types';

// callbacks cache
const callBackQueue: CallbackQueueItem[] = [];

/**
 * In TCFv2, check whether the event status anything but `cmpuishown`, i.e.:
 * - `useractioncomplete`
 * - `tcloaded`
 */
const awaitingUserInteractionInTCFv2 = (state: ConsentState): boolean =>
	state.tcfv2?.eventStatus === 'cmpuishown';

const invokeCallback = (callback: CallbackQueueItem, state: ConsentState) => {
	if (awaitingUserInteractionInTCFv2(state)) return;

	const stateString = JSON.stringify(state);

	// only invoke callback if the consent state has changed
	if (stateString !== callback.lastState) {
		callback.fn(state);
		callback.lastState = stateString;
	}
};

const getConsentState: () => Promise<ConsentState> = async () => {
	if (window.__uspapi) {
		// in USA or AUS - https://git.io/JUOdq
		if (getCurrentFramework() === 'aus')
			return { aus: await getAUSConsentState() };

		return { ccpa: await getCCPAConsentState() };
	}

	if (window.__tcfapi) {
		// in RoW - https://git.io/JfrZr
		return { tcfv2: await getTCFv2ConsentState() };
	}

	throw new Error('no IAB consent framework found on the page');
};

// invokes all stored callbacks with the current consent state
export const invokeCallbacks = (): void => {
	void getConsentState().then((state) => {
		if (awaitingUserInteractionInTCFv2(state)) return;

		callBackQueue.forEach((callback) => invokeCallback(callback, state));
	});
};

export const onConsentChange: (fn: Callback) => void = (callBack) => {
	const newCallback: CallbackQueueItem = { fn: callBack };

	callBackQueue.push(newCallback);

	// if consentState is already available, invoke callback immediately
	void getConsentState()
		.then((consentState) => {
			invokeCallback(newCallback, consentState);
		})
		/* istanbul ignore next */
		.catch(() => {
			// do nothing - callback will be added the list anyway and executed when consent changes
		});
};

export const _ = { getConsentState };
