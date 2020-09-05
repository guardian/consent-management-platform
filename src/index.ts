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

// Store some bits in the global scope for reuse, incase there's more
// than one instance of the CMP on the page in different scopes.
window.guCmpHotFix ||= {};

let CMP: SourcepointImplementation | undefined;

let resolveInitialised: typeof Promise.resolve;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve as typeof Promise.resolve;
});

function init({
	pubData,
	isInUsa,
}: {
	pubData?: PubData;
	isInUsa: boolean;
}): void {
	if (isDisabled() || window.guCmpHotFix.initialised) {
		return;
	}

	if (typeof isInUsa === 'undefined') {
		throw new Error(
			'CMP initialised without `isInUsa` property. `isInUsa` is required.',
		);
	}

	window.guCmpHotFix.initialised = true;

	CMP = isInUsa ? CCPA : TCFv2;
	CMP?.init(pubData || {});
	resolveInitialised?.();
}

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => CMP?.willShowPrivacyMessage() || false);

const showPrivacyManager = () => {
	/* istanbul ignore if */
	if (!CMP) {
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	}
	initialised.then(CMP?.showPrivacyManager);
};

export const cmp = {
	init,
	willShowPrivacyMessage: window.guCmpHotFix.willShowPrivacyMessage ||= willShowPrivacyMessage,
	showPrivacyManager: window.guCmpHotFix.showPrivacyManager ||= showPrivacyManager,

	// special helper methods for disabling CMP
	__isDisabled: window.guCmpHotFix.isDisabled ||= isDisabled,
	__enable: window.guCmpHotFix.enable ||= enable,
	__disable: window.guCmpHotFix.disable ||= disable,
};

export const onConsentChange = (window.guCmpHotFix.onConsentChange ||= actualOnConsentChange);
