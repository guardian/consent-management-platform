import { ConsentState } from './types';

enum VendorIDs {
	// keep the list in README.md up to date with these values
	'a9' = '5f369a02b8e05c308701f829',
	'acast' = '5f203dcb1f0dea790562e20f',
	'braze' = '5ed8c49c4b8ce4571c7ad801',
	'comscore' = '5efefe25b8e05c06542b2a77',
	'facebook-mobile' = '5e716fc09a0b5040d575080f',
	'fb' = '5e7e1298b8e05c54a85c52d2',
	'firebase' = '5e68dbc769e7a93e0b25902f',
	'google-analytics' = '5e542b3a4cd8884eb41b5a72',
	'google-mobile-ads' = '5f1aada6b8e05c306c0597d7',
	'google-sign-in' = '5e4a5fbf26de4a77922b38a6',
	'google-tag-manager' = '5e952f6107d9d20c88e7c975',
	'googletag' = '5f1aada6b8e05c306c0597d7',
	'ias' = '5e7ced57b8e05c485246ccf3',
	'inizio' = '5e37fc3e56a5e6615502f9c9',
	'lotame' = '5ed6aeb1b8e05c241a63c71f',
	'nielsen' = '5ef5c3a5b8e05c69980eaa5b',
	'ophan' = '5f203dbeeaaaa8768fd3226a',
	'permutive' = '5eff0d77969bfa03746427eb',
	'prebid' = '5f22bfd82a6b6c1afd1181a9',
	'redplanet' = '5f199c302425a33f3f090f51',
	'remarketing' = '5ed0eb688a76503f1016578f',
	'sentry' = '5f0f39014effda6e8bbd2006',
	'teads' = '5eab3d5ab8e05c2bbe33f399',
	'twitter' = '5e71760b69966540e4554f01',
	'youtube-player' = '5e7ac3fae30e7d1bc1ebf5e8',
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

	if (consent.aus) {
		if (typeof consent.aus.rejectedVendors === 'undefined') return true;
		const rejected = consent.aus.rejectedVendors.filter(
			(rejectedVendor) => rejectedVendor.[`_id`] === sourcepointId,
		);
		return rejected.length === 0;
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
