export interface CustomVendorRejects {
	rejectedCategories: {
		_id: string;
		name: string;
	}[];

	rejectedVendors: {
		_id: string;
		name: string;
		vendorType: string;
	}[];

	ccpaApplies: true;
}
