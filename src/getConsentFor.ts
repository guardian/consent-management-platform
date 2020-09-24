import { ConsentState } from './types';

enum VendorIDs {
	'google-analytics' = '5e542b3a4cd8884eb41b5a72',
	'google-tag-manager' = '5e952f6107d9d20c88e7c975',
	'googletag' = '5f1aada6b8e05c306c0597d7',
	'remarketing' = '5ed0eb688a76503f1016578f',
	'permutive' = '5eff0d77969bfa03746427eb',
	'ias' = '5e7ced57b8e05c485246ccf3',
	'inizio' = '5e37fc3e56a5e6615502f9c9',
	'fb' = '5e7e1298b8e05c54a85c52d2',
	'facebook-mobile' = '5e716fc09a0b5040d575080f',
	'twitter' = '5e71760b69966540e4554f01',
	'lotame' = '5ed6aeb1b8e05c241a63c71f',
	'comscore' = '5efefe25b8e05c06542b2a77',
	'prebid' = '5f22bfd82a6b6c1afd1181a9',
	'redplanet' = '5f199c302425a33f3f090f51',
	'a9' = '5edf9a821dc4e95986b66df4',
	'ophan' = '5f203dbeeaaaa8768fd3226a',
	'braze' = '5ed8c49c4b8ce4571c7ad801',
	'youtube-player' = '5e7ac3fae30e7d1bc1ebf5e8',
	'google-sign-in' = '5e4a5fbf26de4a77922b38a6',
	'firebase' = '5e68dbc769e7a93e0b25902f',
	'nielsen' = '5ef5c3a5b8e05c69980eaa5b',
	'google-mobile-ads' = '5f1aada6b8e05c306c0597d7',
	'teads' = '5eab3d5ab8e05c2bbe33f399',
	'sentry' = '5f0f39014effda6e8bbd2006',
	'acast' = '5f203dcb1f0dea790562e20f',
}

export const getConsentFor = (
	vendor: keyof typeof VendorIDs,
	consent: ConsentState,
): boolean => {
	const sourcepointId = VendorIDs[vendor];
	if (typeof sourcepointId === 'undefined') {
		throw new Error(
			`Vendor '${vendor}' not found. If it should be added, raise an issue at https://git.io/JUzVL`,
		);
	}

	if (consent.ccpa) {
		return !consent.ccpa.doNotSell;
	}

	const tcfv2Consent: boolean | undefined =
		consent.tcfv2?.vendorConsents[sourcepointId];
	if (typeof tcfv2Consent === 'undefined') {
		// eslint-disable-next-line no-console
		console.warn(
			`No consent returned from Sourcepoint for vendor: '${vendor}'`,
		);
		return false;
	}
	return tcfv2Consent;
};
