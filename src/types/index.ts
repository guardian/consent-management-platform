import type { CustomVendorRejects } from './aus';
import type { CCPAConsentState } from './ccpa';
import type { Country } from './countries';
import type { TCFv2ConsentState } from './tcfv2';

export type Framework = 'tcfv2' | 'ccpa' | 'aus';

export type InitCMP = (arg0: {
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
	grants: Record<
		string,
		{
			purposeGrants: Record<number, boolean>;
			vendorGrant: boolean;
		}
	>;
}
