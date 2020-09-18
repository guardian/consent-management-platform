import { ConsentState } from './types';

enum VendorIDs {
	'google-analytics' = '5e542b3a4cd8884eb41b5a72',
	'google-tag-manager' = '5e952f6107d9d20c88e7c975',
	'remarketing' = '5ed0eb688a76503f1016578f',
	'permutive' = '5eff0d77969bfa03746427eb',
	'ias' = '5e7ced57b8e05c485246ccf3',
	'inizio' = '5e37fc3e56a5e6615502f9c9',
	'fb' = '5e7e1298b8e05c54a85c52d2',
	'twitter' = '5e71760b69966540e4554f01',
	'lotame' = '5ed6aeb1b8e05c241a63c71f',
	'comscore' = '5efefe25b8e05c06542b2a77',
	'prebid' = '5f22bfd82a6b6c1afd1181a9',
	'redplanet' = '5f199c302425a33f3f090f51',
	'a9' = '5edf9a821dc4e95986b66df4',
}

export const getConsentFor = (
	vendor: keyof typeof VendorIDs,
	consent: ConsentState,
): boolean => {
	const vendorConsent: boolean | undefined =
		consent.tcfv2?.vendorConsents[VendorIDs[vendor]];
	if (!vendorConsent) {
		throw new Error(`Consent not found for vendor ${vendor}`);
	}
	return vendorConsent;
};
