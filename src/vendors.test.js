import axios from 'axios';
import { VendorIDs } from './vendors';

const cmpBaseUrl = 'sourcepoint.mgr.consensu.org';
const guardianId = '5ec67f5bb8e05c4a1160fda1';
const guardianVendorListUrl = `https://${cmpBaseUrl}/tcfv2/vendor-list?vendorListId=${guardianId}`;

it('the vendor ids used must be a subset of those known by the IAB as our vendors', async () => {
	const iabGuardianVendorListResponse = await axios.get(
		guardianVendorListUrl,
	);

	const vendorIds = Object.values(VendorIDs).flat();

	const iabVendorIds = iabGuardianVendorListResponse.data['vendors'].map(
		(vendor) => vendor['_id'],
	);

	const missingVendorIds = vendorIds.filter(
		(id) => !iabVendorIds.includes(id),
	);

	expect(missingVendorIds).toStrictEqual([]);
});
