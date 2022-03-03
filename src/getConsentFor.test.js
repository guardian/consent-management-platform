// cSpell:ignore doesnotexist

import axios from 'axios';
import { getConsentFor, VendorIDs } from './getConsentFor';

const cmpBaseUrl = 'sourcepoint.mgr.consensu.org';
const guardianId = '5ec67f5bb8e05c4a1160fda1';
const guardianVendorListUrl = `https://${cmpBaseUrl}/tcfv2/vendor-list?vendorListId=${guardianId}`;

const googleAnalytics = '5e542b3a4cd8884eb41b5a72';

const tcfv2ConsentNotFound = {
	tcfv2: { vendorConsents: { doesnotexist: true } },
};

const tcfv2ConsentFoundTrue = {
	tcfv2: { vendorConsents: { [googleAnalytics]: true } },
};

const tcfv2ConsentFoundFalse = {
	tcfv2: { vendorConsents: { [googleAnalytics]: false } },
};

const ccpaWithConsent = { ccpa: { doNotSell: false } };

const ccpaWithoutConsent = { ccpa: { doNotSell: true } };

const ausWithConsent = { aus: { personalisedAdvertising: true } };

const ausWithoutConsent = { aus: { personalisedAdvertising: false } };

it('throws an error if the vendor found ', () => {
	expect(() => {
		getConsentFor('doesnotexist', tcfv2ConsentFoundTrue);
	}).toThrow("Vendor 'doesnotexist' not found");
});

test.each([
	['tcfv2 (unknown)', false, 'google-analytics', tcfv2ConsentNotFound],
	['tcfv2', true, 'google-analytics', tcfv2ConsentFoundTrue],
	['tcfv2', false, 'google-analytics', tcfv2ConsentFoundFalse],
	['ccpa', true, 'google-analytics', ccpaWithConsent],
	['ccpa', false, 'google-analytics', ccpaWithoutConsent],
	['aus', true, 'google-analytics', ausWithConsent],
	['aus', false, 'google-analytics', ausWithoutConsent],
])(
	`In %s mode, returns %s, for vendor %s`,
	(cmpMode, expected, vendor, mock) => {
		expect(getConsentFor(vendor, mock)).toBe(expected);
	},
);

it('the vendor ids used must be a subset of those known by the IAB as our vendors', async () => {
	const iabGuardianVendorListResponse = await axios.get(
		guardianVendorListUrl,
	);

	const vendorIds = Object.values(VendorIDs);

	const iabVendorIds = iabGuardianVendorListResponse.data['vendors'].map(
		(vendor) => vendor['_id'],
	);

	const missingVendorIds = vendorIds.filter(
		(id) => !iabVendorIds.includes(id),
	);

	expect(missingVendorIds).toStrictEqual([]);
});
