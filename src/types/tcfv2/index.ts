export interface TCFv2ConsentList {
	[key: string]: boolean;
}

export type TCEventStatusCode =
	| 'tcloaded'
	| 'cmpuishown'
	| 'useractioncomplete';

export interface TCFv2ConsentState {
	consents: TCFv2ConsentList;
	eventStatus: TCEventStatusCode;
	vendorConsents: TCFv2ConsentList;
}

// From the IAB spec – https://git.io/JUmw8
export type TCPingStatusCode =
	| 'stub'
	| 'loading'
	| 'loaded'
	| 'error'
	| 'visible'
	| 'hidden'
	| 'disabled';
