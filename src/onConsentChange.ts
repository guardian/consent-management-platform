/* eslint-disable no-underscore-dangle */

import { TCFData, VendorConsents } from './types';

interface ConsentVector {
	[key: string]: boolean;
}

export interface ConsentState {
	tcfv2?: {
		consents: ConsentVector;
		eventStatus: 'tcloaded' | 'cmpuishown' | 'useractioncomplete';
		vendorConsents: ConsentVector;
	};
	ccpa?: {
		doNotSell: boolean;
	};
}

type Callback = (arg0: ConsentState) => void;
type CallbackQueueItem = { fn: Callback; lastState?: string };

// callbacks cache
const callBackQueue: CallbackQueueItem[] = [];

const invokeCallback = (callback: CallbackQueueItem, state: ConsentState) => {
	const stateString = JSON.stringify(state);

	if (stateString !== callback.lastState) {
		callback.fn(state);
		// eslint-disable-next-line no-param-reassign
		callback.lastState = stateString;
	}
};

// invokes all stored callbacks with the current consent state
export const invokeCallbacks = () => {
	getConsentState().then((state) => {
		// this function is triggered by SP events.
		// but THEY sometimes fire even if consent state hasn't _actually_ changed,
		// e.g. user closes dialogue without making changes.
		// therefore, only invoke callbacks if the consent state _has_ changed:

		callBackQueue.forEach((callback) => invokeCallback(callback, state));
	});
};

// get the current constent state using the official IAB methods
const getConsentState: () => Promise<ConsentState> = () => {
	return new Promise((resolve, reject) => {
		// in USA - https://github.com/InteractiveAdvertisingBureau/USPrivacy/blob/master/CCPA/USP%20API.md
		/* istanbul ignore else */
		if (window.__uspapi) {
			window.__uspapi('getUSPData', 1, (uspData, success) => {
				/* istanbul ignore else */
				if (success) {
					let doNotSell = false;

					if (uspData?.uspString?.charAt(2) === 'Y') {
						doNotSell = true;
					}

					resolve({ ccpa: { doNotSell } });
				} else {
					reject();
				}
			});
		} else if (window.__tcfapi) {
			// in RoW - https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md

			const getTCDataPromise = new Promise((subResolve, subReject) => {
				window.__tcfapi?.('getTCData', 2, (tcfData, success) => {
					if (success) subResolve(tcfData);
					else subReject(new Error('Unable to get consent data'));
				});
			});

			const getCustomVendorConsentsPromise = new Promise(
				(subResolve, subReject) => {
					window.__tcfapi?.(
						'getCustomVendorConsents',
						2,
						(vendorConsents, success) => {
							if (success && vendorConsents) subResolve(vendorConsents);
							else subReject(new Error('Unable to get custom vendors consent'));
						},
					);
				},
			);

			Promise.all([getTCDataPromise, getCustomVendorConsentsPromise])
				.then((data) => {
					const consents = fillAllConsents(
						(data[0] as TCFData).purpose.consents,
					);
					const { eventStatus } = data[0] as TCFData;
					const { grants } = data[1] as VendorConsents;
					const vendorConsents = Object.keys(grants)
						.sort()
						.reduce(
							(acc, cur) => ({ ...acc, [cur]: grants[cur].vendorGrant }),
							{},
						);
					resolve({
						tcfv2: {
							consents,
							eventStatus,
							vendorConsents,
						},
					});
				})
				.catch(() =>
					reject(new Error('Unable to get custom vendor or consent data')),
				);
		} else {
			// no frameworks are initialised yet.
			// could be a bug, could be called too soon ¯\_(ツ)_/¯
			reject(new Error('no IAB consent framework found on the page'));
		}
	});
};

type ConsentObject = (consentVector: ConsentVector) => ConsentVector;

const fillAllConsents: ConsentObject = (consentVector) => {
	return {
		'1': false,
		'2': false,
		'3': false,
		'4': false,
		'5': false,
		'6': false,
		'7': false,
		'8': false,
		'9': false,
		'10': false,
		...consentVector,
	};
};

export const onConsentChange = (callBack: Callback) => {
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
			// do nothing - callback will be added the list anyway
		});
};

export const _ = { getConsentState, fillAllConsents };
