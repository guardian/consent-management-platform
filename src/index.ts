/* eslint-disable no-console */

import { CCPA } from './ccpa';
import { TCFv2 } from './tcfv2';
import {
	SourcepointImplementation,
	PubData,
	WillShowPrivacyMessage,
} from './types';

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
	if (window?.guCmpHotFix?.initialised) {
		return;
	}

	if (window) {
		window.guCmpHotFix = {
			...window.guCmpHotFix,
			initialised: true,
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

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => CMP?.willShowPrivacyMessage() || false);

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
	window.guCmpHotFix = {
		...actualExports,
		...window.guCmpHotFix,
	};
}

export const { cmp, onConsentChange } =
	(window?.guCmpHotFix as typeof actualExports) || actualExports;
// *************** END commercial.dcr.js hotfix ***************
