import { CustomVendorRejects } from './aus';
import { CCPAConsentState } from './ccpa';
import { Country } from './countries';
import { TCFv2ConsentState } from './tcfv2';

export type Framework = 'tcfv2' | 'ccpa' | 'aus';

export type InitCMP = ({
	pubData,
	country,
	isInUsa, // DEPRECATED: Will be removed in next major version
}: {
	pubData?: PubData;
	country?: Country;
	isInUsa?: boolean;
}) => void;

export interface ConsentState {
	tcfv2?: TCFv2ConsentState;
	ccpa?: CCPAConsentState;
	aus?: CustomVendorRejects;
}
export interface PubData {
	browserId?: string;
	pageViewId?: string;
	[propName: string]: unknown;
}
export interface SourcepointImplementation {
	init: (pubData?: PubData) => void;
	willShowPrivacyMessage: WillShowPrivacyMessage;
	showPrivacyManager: () => void;
}
export type WillShowPrivacyMessage = () => Promise<boolean>;

export type Callback = (arg0: ConsentState) => void;
export type CallbackQueueItem = { fn: Callback; lastState?: string };

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
