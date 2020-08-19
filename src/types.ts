export interface PubData {
	browserId?: string;
}

export interface SourcepointImplementation {
	init: (pubData?: PubData) => void;
	willShowPrivacyMessage: WillShowPrivacyMessage;
	showPrivacyManager: () => void;
}

export type WillShowPrivacyMessage = () => Promise<boolean>;

export type SourcePointChoiceType =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15;

// https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support/__tcfapi-getcustomvendorconsents-api
interface VendorConsents {
	grants: {
		[key: string]: {
			purposeGrants: {
				[key: number]: boolean;
			};
			vendorGrant: boolean;
		};
	};
}
