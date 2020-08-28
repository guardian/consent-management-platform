/* eslint-disable no-underscore-dangle */

import { getTCData, getCustomVendorConsents } from './api';
import { TCEventStatusCode } from './types/TCEventStatusCode';
import { ConsentList } from './types/ConsentList';

export interface TCFv2ConsentState {
	consents: ConsentList;
	eventStatus: TCEventStatusCode;
	vendorConsents: ConsentList;
}

const defaultConsents: ConsentList = {
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

	const vendorConsents: ConsentList = Object.entries(grants).reduce(
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
