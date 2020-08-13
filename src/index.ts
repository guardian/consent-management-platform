/* eslint-disable no-console */

import { oldCmp } from './oldCmp';
import { CCPA } from './ccpa';
import { TCFv2 } from './tcfv2';
import { SourcepointImplementation, PubData } from './types';

// *************** START commercial.dcr.js hotfix ***************
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
// *************** END commercial.dcr.js hotfix ***************

let CMP: SourcepointImplementation | undefined;

let resolveInitialised: Function | undefined;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve;
});

function init({ pubData, isInUsa }: { pubData?: PubData; isInUsa: boolean }) {
	// *************** START commercial.dcr.js hotfix ***************
	if (window?.guardian?.cmp?.initialised) {
		return;
	}

	if (window) {
		window.guardian = {
			...window.guardian,
			cmp: {
				...window.guardian?.cmp,
				initialised: true,
			},
		};
	}
	// *************** END commercial.dcr.js hotfix ***************

	if (typeof isInUsa === 'undefined') {
		throw new Error(
			'CMP initialised without `isInUsa` property. `isInUsa` is required.',
		);
	}

	CMP = isInUsa ? CCPA : TCFv2;
	CMP?.init(pubData);
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

// *************** START commercial.dcr.js hotfix ***************
// export const cmp = {
// 	init,
// 	willShowPrivacyMessage,
// 	showPrivacyManager,
// };

// export { onConsentChange } from './onConsentChange';

const actualExports = {
	cmp: { init, willShowPrivacyMessage, showPrivacyManager },
	onConsentChange: actualOnConsentChange,
};

if (window) {
	window.guardian = {
		cmp: {
			...actualExports,
			...window.guardian?.cmp,
		},
	};
}

export const { cmp, onConsentChange } =
	(window?.guardian?.cmp as typeof actualExports) || actualExports;
// *************** END commercial.dcr.js hotfix ***************

export { oldCmp };
