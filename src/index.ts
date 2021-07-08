import { log } from '@guardian/libs';
import { disable, enable, isDisabled } from './disable';
import { getConsentFor as actualGetConsentFor } from './getConsentFor';
import { setCurrentFramework } from './getCurrentFramework';
import { getFramework } from './getFramework';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import type {
	CMP,
	InitCMP,
	WillShowPrivacyMessage,
} from './types';
import { UnifiedCMP } from './unified/index';

// Store some bits in the global scope for reuse, in case there's more
// than one instance of the CMP on the page in different scopes.
window.guCmpHotFix ||= {};

let _willShowPrivacyMessage: undefined | boolean;
let initComplete = false;

let resolveInitialised: (value?: unknown) => void;
const initialised = new Promise((resolve) => {
	resolveInitialised = resolve;
});

const init: InitCMP = ({
	pubData,
	country,
	isInUsa, // DEPRECATED: Will be removed in next major version
}) => {
	if (isDisabled()) return;

	if (window.guCmpHotFix.initialised) {
		if (window.guCmpHotFix.cmp?.version !== __PACKAGE_VERSION__)
			console.warn('Two different versions of the CMP are running:', [
				__PACKAGE_VERSION__,
				window.guCmpHotFix.cmp?.version,
			]);
		return;
	}

	// this is slightly different to initComplete - it's there to
	// prevent another instance of CMP initialising, so we set this true asap.
	// initComplete is set true once we have _finished_ initialising
	window.guCmpHotFix.initialised = true;

	if (typeof isInUsa !== 'undefined') {
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

	setCurrentFramework(framework);

	UnifiedCMP.init(framework, pubData ?? {});

	void UnifiedCMP.willShowPrivacyMessage().then((willShowValue) => {
		_willShowPrivacyMessage = willShowValue;
		initComplete = true;
		log('cmp', 'initComplete');
	});

	resolveInitialised();
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => UnifiedCMP.willShowPrivacyMessage() ?? false);

const willShowPrivacyMessageSync = () => {
	if (_willShowPrivacyMessage !== undefined) {
		return _willShowPrivacyMessage;
	}
	throw new Error(
		'CMP has not been initialised. Use the async willShowPrivacyMessage() instead.',
	);
};

const hasInitialised = () => initComplete;

const showPrivacyManager = () => {
	void initialised.then(UnifiedCMP.showPrivacyManager);
};

export const cmp: CMP = (window.guCmpHotFix.cmp ||= {
	init,
	willShowPrivacyMessage,
	willShowPrivacyMessageSync,
	hasInitialised,
	showPrivacyManager,
	version: __PACKAGE_VERSION__,

	// special helper methods for disabling CMP
	__isDisabled: isDisabled,
	__enable: enable,
	__disable: disable,
});

export const onConsentChange = (window.guCmpHotFix.onConsentChange ||=
	actualOnConsentChange);
export const getConsentFor = (window.guCmpHotFix.getConsentFor ||=
	actualGetConsentFor);
