import { ConsentState } from './types';

enum VendorIDs {
	'google-analytics' = '5e542b3a4cd8884eb41b5a72',
	'google-tag-manager' = '5e952f6107d9d20c88e7c975',
}

export const getConsentFor = (
	vendor: keyof typeof VendorIDs,
	consent: ConsentState,
): string => {
	return consent.tcfv2?.vendorConsents.grants[VendorIDs[vendor]];
};
