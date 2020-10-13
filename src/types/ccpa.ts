export interface CCPAConsentState {
	doNotSell: boolean;
}

export interface CCPAData {
	version: number;
	uspString: string;
}

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
