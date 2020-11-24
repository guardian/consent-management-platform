import { getLocale } from '@guardian/libs';
import { AUS } from './aus';
import { CCPA } from './ccpa';
import { disable, enable, isDisabled } from './disable';
import { getConsentFor as actualGetConsentFor } from './getConsentFor';
import { setCurrentFramework } from './getCurrentFramework';
import { getFramework } from './getFramework';
import { onConsentChange as actualOnConsentChange } from './onConsentChange';
import { TCFv2 } from './tcfv2';
import type {
	InitCMP,
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

const init: InitCMP = async ({ pubData } = {}) => {
	if (isDisabled() || window.guCmpHotFix.initialised) {
		if (window.guCmpHotFix.cmp?.version !== __PACKAGE_VERSION__)
			console.warn('Two different versions of the CMP are running:', [
				__PACKAGE_VERSION__,
				window.guCmpHotFix.cmp?.version,
			]);
		return;
	}

	const locale = await getLocale();

	if (locale) {
		const framework = getFramework(locale);

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

		CMP.init(pubData ?? {});
		resolveInitialised();
	} else {
		throw new Error('CMP failed to get locale');
	}
};

const willShowPrivacyMessage: WillShowPrivacyMessage = () =>
	initialised.then(() => CMP?.willShowPrivacyMessage() ?? false);

const showPrivacyManager = () => {
	/* istanbul ignore if */
	if (!CMP) {
		console.warn(
			'cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.',
		);
	}
	void initialised.then(CMP?.showPrivacyManager);
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
