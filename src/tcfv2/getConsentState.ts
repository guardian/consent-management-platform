/* eslint-disable no-underscore-dangle */

import { getTCData, getCustomVendorConsents } from './api';
import { EventStatusCode } from './types/EventStatusCode';
import { Consents } from './types/Consents';

export interface TCFv2ConsentState {
	consents: Consents;
	eventStatus: EventStatusCode;
	vendorConsents: Consents;
}

const defaultConsents: Consents = {
	'1': false,
	'2': false,
	'3': false,
	'4': false,
	'5': false,
	'6': false,
	'7': false,
	'8': false,
	'9': false,
	'10': false,
};

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<TCFv2ConsentState> = async () => {
	const [tcData, customVendors] = await Promise.all([
		getTCData(),
		getCustomVendorConsents(),
	]);

	const consents = {
		...defaultConsents,
		...tcData.purpose.consents,
	};

	const { eventStatus } = tcData;
	const { grants } = customVendors;

	const vendorConsents: Consents = Object.entries(grants).reduce(
		(acc, [vendor, { vendorGrant }]) => ({
			...acc,
			[vendor]: vendorGrant,
		}),
		{},
	);

	return {
		consents,
		eventStatus,
		vendorConsents,
	};
};
