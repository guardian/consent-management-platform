export interface TCFv2ConsentList {
	[key: string]: boolean;
}

export interface TCFv2ConsentState {
	consents: TCFv2ConsentList;
	eventStatus: TCEventStatusCode;
	vendorConsents: TCFv2ConsentList;
	addtlConsent: string;
	gdprApplies: boolean | undefined;
	tcString: string;
}

export interface ConsentVector {
	[key: string]: boolean;
}

// From the IAB spec – https://git.io/JUmoi
export type TCEventStatusCode =
	| 'tcloaded'
	| 'cmpuishown'
	| 'useractioncomplete';

// From the IAB spec – https://git.io/JUmw8
export type TCPingStatusCode =
	| 'stub'
	| 'loading'
	| 'loaded'
	| 'error'
	| 'visible'
	| 'hidden'
	| 'disabled';
