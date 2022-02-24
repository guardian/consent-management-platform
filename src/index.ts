import { log } from '@guardian/libs';
import { AUS } from './aus';
import { CCPA } from './ccpa';
import { disable, enable, isDisabled } from './disable';
import { getConsentFor as actualGetConsentFor } from './getConsentFor';
import { setCurrentFramework } from './getCurrentFramework';
import { getFramework } from './getFramework';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import { TCFv2 } from './tcfv2';
import type {
	CMP,
	InitCMP,
	PubData,
	SourcepointImplementation,
	WillShowPrivacyMessage,
} from './types';
import type { Country } from './types/countries';

const isServerSide = typeof window === 'undefined';

// Store some bits in the global scope for reuse, in case there's more
// than one instance of the CMP on the page in different scopes.
if (!isServerSide) {
	window.guCmpHotFix ||= {};
}

let frameworkCMP: SourcepointImplementation | undefined;

let _willShowPrivacyMessage: undefined | boolean;
let initComplete = false;

let resolveInitialised: (value?: unknown) => void;

const initialised = new Promise((resolve) => {
	resolveInitialised = resolve;
});

const init: InitCMP = ({ pubData, country }) => {
	if (isDisabled() || isServerSide) return;

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

	if (typeof country === 'undefined') {
		throw new Error(
			'CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.',
		);
	}

	const framework = getFramework(country);

	switch (framework) {
		case 'ccpa':
			frameworkCMP = CCPA;
			break;
		case 'aus':
			frameworkCMP = AUS;
			break;
		case 'tcfv2':
		default:
			// default is also 'tcfv2'
			frameworkCMP = TCFv2;
			break;
	}

	setCurrentFramework(framework);

	frameworkCMP.init(pubData ?? {});

	void frameworkCMP.willShowPrivacyMessage().then((willShowValue) => {
		_willShowPrivacyMessage = willShowValue;
		initComplete = true;
		log('cmp', 'initComplete');
	});

	resolveInitialised();
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => frameworkCMP?.willShowPrivacyMessage() ?? false);

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
	/* istanbul ignore if */
	if (!frameworkCMP) {
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	}
	void initialised.then(frameworkCMP?.showPrivacyManager);
};

export const cmp: CMP = (() => {
	if (isServerSide) {
		return {
			init: () => void 0,
			showPrivacyManager: () => void 0,
			willShowPrivacyMessage: () => new Promise(() => false),
			willShowPrivacyMessageSync: () => false,
			hasInitialised: () => true,
			version: __PACKAGE_VERSION__,

			// special helper methods for disabling CMP
			__isDisabled: isDisabled,
			__enable: enable,
			__disable: disable,
		} as CMP;
	}

	return (window.guCmpHotFix.cmp ||= {
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
})();

export const onConsentChange = (() => {
	if (isServerSide) {
		return () => void 0;
	}
	return (window.guCmpHotFix.onConsentChange ||= actualOnConsentChange);
})();

export const getConsentFor = (() => {
	if (isServerSide) {
		actualGetConsentFor;
	}
	return (window.guCmpHotFix.getConsentFor ||= actualGetConsentFor);
})();
