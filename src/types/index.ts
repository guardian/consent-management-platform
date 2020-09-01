import { CCPAConsentState } from './ccpa';
import { TCFv2ConsentState } from './tcfv2';

export interface ConsentState {
	tcfv2?: TCFv2ConsentState;
	ccpa?: CCPAConsentState;
}
export interface PubData {
	browserId?: string;
}
export interface SourcepointImplementation {
	init: (pubData?: PubData) => void;
	willShowPrivacyMessage: WillShowPrivacyMessage;
	showPrivacyManager: () => void;
}
export type WillShowPrivacyMessage = () => Promise<boolean>;

// https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support/__tcfapi-getcustomvendorconsents-api
export interface VendorConsents {
	grants: {
		[key: string]: {
			purposeGrants: {
				[key: number]: boolean;
			};
			vendorGrant: boolean;
		};
	};
}
