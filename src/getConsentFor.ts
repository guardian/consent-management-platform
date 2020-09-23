import { ConsentState, VendorIDs } from './types';

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
		console.warn(
			`No consent returned from Sourcepoint for vendor: '${vendor}'`,
		);
		return false;
	}
	return tcfv2Consent;
};
