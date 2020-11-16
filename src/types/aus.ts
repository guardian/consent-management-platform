export interface CustomVendorRejects {
	rejectedCategories: Array<{
		_id: string;
		name: string;
	}>;

	rejectedVendors: Array<{
		_id: string;
		name: string;
		vendorType: string;
	}>;

	ccpaApplies: true;
}
