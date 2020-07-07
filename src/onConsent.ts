/* eslint-disable no-underscore-dangle */

interface ConsentState {
	tcf?: {};
	ccpa?: {
		doNotSell: boolean;
	};
}

interface ComparedConsentState {
	hasChanged: boolean;
	state: ConsentState;
}

type Callback = (arg0: ConsentState) => void;

// callbacks cache
const callBacks: Array<Callback> = [];

// invokes all stored callbacks with the current consent state
export const invokeCallbacks = () => {
	getConsentState().then(({ state, hasChanged }) => {
		// this function is triggered by SP events.
		// but THEY sometimes fire even if consent state hasn't _actually_ changed,
		// e.g. user closes dialogue without making changes.
		// therefore, only invoke callbacks if the consent state _has_ changed:
		if (hasChanged) {
			callBacks.forEach((callBack) => callBack(state));
		}
	});
};

// get the current constent state using the official IAB methods
const getConsentState: () => Promise<ComparedConsentState> = () =>
	new Promise((resolve, reject) => {
		// in USA - https://github.com/InteractiveAdvertisingBureau/USPrivacy/blob/master/CCPA/USP%20API.md
		if (window.__uspapi) {
			window.__uspapi('getUSPData', 1, (uspData, success) => {
				if (success) {
					let doNotSell = false;

					if (uspData?.uspString?.charAt(2) === 'Y') {
						doNotSell = true;
					}

					resolve(compareState({ ccpa: { doNotSell } }));
				} else {
					reject();
				}
			});
		} else if (window.__tcfapi) {
			// in RoW - https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md
			window.__tcfapi('getTCData', 2, (tcfData, success) => {
				if (success) {
					resolve(compareState({ tcf: tcfData?.purpose.consents }));
				} else {
					reject();
				}
			});
		} else {
			// no frameworks are initialised yet.
			// could be a bug, could be called too soon ¯\_(ツ)_/¯
			reject(new Error('no IAB consent framework found on the page'));
		}
	});

// cache current consent state as a JSON for quick comparison
let currentConsentState: string = JSON.stringify(undefined);

// compare new state with current state
type CompareState = (newState: ConsentState) => ComparedConsentState;

const compareState: CompareState = (newState) => {
	const newConsentState = JSON.stringify(newState);
	const hasChanged = newConsentState !== currentConsentState;

	currentConsentState = newConsentState;

	return {
		state: newState,
		hasChanged,
	};
};

export const onConsent = (callBack: Callback) => {
	callBacks.push(callBack);

	// if consentState is already available, invoke callback immediately
	getConsentState()
		.then((consentState) => {
			if (consentState) callBack(consentState.state);
		})
		.catch(() => {
			// do nothing - callback will be added the list anyway
		});
};
