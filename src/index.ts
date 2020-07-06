/* eslint-disable no-console */

import { CCPA } from './ccpa';
import { TCFv2 } from './tcfv2';
import { onConsent } from './onConsent';

let CMP: SourcepointImplementation | undefined;

let resolveInitialised: Function | undefined;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve;
});

function init({ isInUsa }: { isInUsa: boolean }) {
	if (typeof isInUsa === 'undefined') {
		throw new Error(
			'CMP initialised without `isInUsa` property. `isInUsa` is required.',
		);
	}

	CMP = isInUsa ? CCPA : TCFv2;
	CMP?.init();
	resolveInitialised?.();
}

const willShowPrivacyMessage = () =>
	initialised.then(() => CMP?.willShowPrivacyMessage());

function showPrivacyManager() {
	if (!CMP)
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	initialised.then(() => CMP?.showPrivacyManager());
}

export const cmp = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
	onConsent,
};

// // race condition - called before init so ccpa is false
// export const onIabConsentNotification = (callback: IabPurposeCallback) =>
// 	CCPA_APPLIES
// 		? ccpaOnIabConsentNotification(callback as CcpaPurposeCallback)
// 		: tcfOnIabConsentNotification(callback as TcfPurposeCallback);
//
// export { setErrorHandler } from './tcf/error';
// export { shouldShow } from './tcf/cmp-ui';
// export { onGuConsentNotification } from './tcf/core';
