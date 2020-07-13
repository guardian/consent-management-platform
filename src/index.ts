/* eslint-disable no-console */

import { oldCmp as olderCmp } from './oldCmp';
import { CCPA } from './ccpa';
import { TCFv2 } from './tcfv2';

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
	CMP.init();
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
};

export { onConsentChange } from './onConsentChange';

export const oldCmp = olderCmp;
