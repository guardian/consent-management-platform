/* eslint-disable no-console */

import { AUS } from './aus';
import { CCPA } from './ccpa';
import { disable, enable, isDisabled } from './disable';
import { getConsentFor as actualGetConsentFor } from './getConsentFor';
import { setCurrentFramework } from './getCurrentFramework';
import { getFramework } from './getFramework';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import { TCFv2 } from './tcfv2';
import {
	InitCmp,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from './types';

// Store some bits in the global scope for reuse, in case there's more
// than one instance of the CMP on the page in different scopes.
window.guCmpHotFix ||= {};

let CMP: SourcepointImplementation | undefined;

let resolveInitialised: (value?: unknown) => void;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve;
});

function init({
	pubData,
	country,
	isInUsa, // DEPRECATED: Will be removed in next major version
}: InitCmp): void {
	if (isDisabled() || window.guCmpHotFix.initialised) {
		if (window.guCmpHotFix.cmp?.version !== __PACKAGE_VERSION__)
			console.warn('Two different versions of the CMP are running:', [
				__PACKAGE_VERSION__,
				window.guCmpHotFix.cmp?.version,
			]);
		return;
	}

	if (typeof isInUsa !== 'undefined') {
		// eslint-disable-next-line no-param-reassign
		country = isInUsa ? 'US' : 'GB';

		console.warn(
			'`isInUsa` will soon be deprecated. Prefer using `country` instead.',
		);
	}

	if (typeof country === 'undefined') {
		throw new Error(
			'CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.',
		);
	}

	const framework = getFramework(country);

	window.guCmpHotFix.initialised = true;

	switch (framework) {
		case 'ccpa':
			CMP = CCPA;
			break;
		case 'aus':
			CMP = AUS;
			break;
		case 'tcfv2':
		default:
			// default is also 'tcfv2'
			CMP = TCFv2;
			break;
	}

	setCurrentFramework(framework);

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

export const cmp = (window.guCmpHotFix.cmp ||= {
	init,
	willShowPrivacyMessage,
	showPrivacyManager,
	version: __PACKAGE_VERSION__,

	// special helper methods for disabling CMP
	__isDisabled: isDisabled,
	__enable: enable,
	__disable: disable,
});

export const onConsentChange = (window.guCmpHotFix.onConsentChange ||= actualOnConsentChange);
export const getConsentFor = (window.guCmpHotFix.getConsentFor ||= actualGetConsentFor);
