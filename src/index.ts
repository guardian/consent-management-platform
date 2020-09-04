/* eslint-disable no-console */

import { CCPA } from './ccpa';
import { disable, enable, isDisabled } from './disable';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import { TCFv2 } from './tcfv2';
import {
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from './types';

// *************** START commercial.dcr.js hotfix ***************
// *************** END commercial.dcr.js hotfix ***************

let CMP: SourcepointImplementation | undefined;

let resolveInitialised: typeof Promise.resolve;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve as typeof Promise.resolve;
});

function init({ pubData, isInUsa }: { pubData?: PubData; isInUsa: boolean }) {
	// provide a way to disable consent for test envs
	if (isDisabled()) return;

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
	CMP?.init(pubData || {});
	resolveInitialised?.();
}

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => CMP?.willShowPrivacyMessage() || false);

function showPrivacyManager() {
	/* istanbul ignore if */
	if (!CMP) {
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	}
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
	cmp: {
		init,
		willShowPrivacyMessage,
		showPrivacyManager,

		// special helper methods for disabling CMP
		__isDisabled: isDisabled,
		__enable: enable,
		__disable: disable,
	},
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
