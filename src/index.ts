/* eslint-disable no-console */

import { CCPA } from './ccpa';
import { disable, enable, isDisabled } from './disable';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import { TCFv2 } from './tcfv2';
import {
	OnConsentChange,
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from './types';

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
	// provide a way to disable consent for test envs
	if (isDisabled()) return;

	if (window.guCmpHotFix.initialised) {
		return;
	}
	window.guCmpHotFix.initialised = true;

	if (typeof isInUsa === 'undefined') {
		throw new Error(
			'CMP initialised without `isInUsa` property. `isInUsa` is required.',
		);
	}

	CMP = isInUsa ? CCPA : TCFv2;
	CMP?.init(pubData || {});
	resolveInitialised?.();
}

const willShowPrivacyMessage: WillShowPrivacyMessage = (window.guCmpHotFix.willShowPrivacyMessage ||= () =>
	initialised.then(() => CMP?.willShowPrivacyMessage() || false));

const showPrivacyManager = (window.guCmpHotFix.showPrivacyManager ||= () => {
	/* istanbul ignore if */
	if (!CMP) {
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	}
	initialised.then(CMP?.showPrivacyManager);
});

export const cmp = {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,

	// special helper methods for disabling CMP
	__isDisabled: isDisabled,
	__enable: enable,
	__disable: disable,
};

const onConsentChange: OnConsentChange = (window.guCmpHotFix.onConsentChange ||= actualOnConsentChange);
export { onConsentChange };
