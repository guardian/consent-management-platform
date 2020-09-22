import { ConsentState, VendorIDs } from './types';

export const getConsentFor = (
	vendor: keyof typeof VendorIDs,
	consent: ConsentState,
): boolean => {
	const sourcepointId = VendorIDs[vendor];
	if (typeof sourcepointId === 'undefined') {
		throw new Error(`Vendor '${vendor}' not found`);
	}
	const vendorConsent: boolean | undefined =
		consent.tcfv2?.vendorConsents[sourcepointId];
	if (typeof vendorConsent === 'undefined') {
		throw new Error(`No consent returned from SP for vendor: '${vendor}'`);
	}
	return vendorConsent;
};
