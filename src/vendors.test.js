import axios from 'axios';
import { TCFV2VendorIDs } from './vendors';

const cmpBaseUrl = 'cdn.privacy-mgmt.com';
const guardianId = '5ec67f5bb8e05c4a1160fda1';
const guardianVendorListUrl = `https://${cmpBaseUrl}/consent/tcfv2/vendor-list?vendorListId=${guardianId}`;

it('the vendor ids used must be a subset of those known by the IAB as our vendors', async () => {
	const iabGuardianVendorListResponse = await axios.get(
		guardianVendorListUrl,
	);

	const vendorIds = Object.values(TCFV2VendorIDs).flat();

	// Remove vendors not part of TCFV2
	// ListOfVendorsNotIncludedInTCFV2IABList.forEach((vendor) => {
	// 	vendorIds = vendorIds.filter(
	// 		(vendorId) => VendorIDs[vendor] != vendorId,
	// 	);
	// });

	const iabVendorIds = iabGuardianVendorListResponse.data['vendors'].map(
		(vendor) => vendor['_id'],
	);

	const missingVendorIds = vendorIds.filter(
		(id) => !iabVendorIds.includes(id),
	);

	expect(missingVendorIds).toStrictEqual([]);
});
