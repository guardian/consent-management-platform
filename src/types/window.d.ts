import type { getConsentFor } from '../getConsentFor';
import type { Property } from '../lib/property';
import type { EndPoint } from '../lib/sourcepointConfig';
import type { onConsentChange } from '../onConsentChange';
import type { CCPAData } from './ccpa';
import type { TCData } from './tcfv2/TCData';
import type { CMP, PubData } from '.';

type OnMessageChoiceSelect = (
	arg0: number,
	arg1: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
) => void;

declare global {
	interface Window {
		// *************** START commercial.dcr.js hotfix ***************
		guCmpHotFix: {
			initialised?: boolean;
			cmp?: CMP;
			onConsentChange?: typeof onConsentChange;
			getConsentFor?: typeof getConsentFor;
		};
		// *************** END commercial.dcr.js hotfix ***************
		_sp_queue: []
		_sp_?: {
			config: {
				baseEndpoint: EndPoint;
				accountId: number;
				propertyHref: Property;
				propertyId?: string;
				targetingParams: {
					framework: string;
				};
				ccpa?: {
					targetingParams?: {
						framework: string;
					};
				};
				gdpr: {
					targetingParams?: {
						framework: string;
					};
				};
				pubData: PubData;
				events?: {
					onMessageReceiveData: (message_type: any, data: {
						messageId: 0 | string;
					}) => void;
					onConsentReady: (message_type: any, consentUUID: any, euconsent: any) => void;
					onMessageReady: (message_type: any) => void;
					onMessageChoiceSelect: (message_type: any, choice_id: any, choiceTypeID: any) => void;
					onPrivacyManagerAction: (message_type: any, pmData: any) => void;
					onMessageChoiceError: (message_type: any, err: any) => void;
					onPMCancel: (message_type: any) => void;
					onSPPMObjectReady: () => void;
					onError: (message_type: any, errorCode: any, errorObject: any, userReset: any) => void;
					// onMessageChoiceSelect: OnMessageChoiceSelect;
				};
			};
			gdpr?: {
				loadPrivacyManagerModal?: (id: number) => void;
			};
			ccpa?: {
				loadPrivacyManagerModal?: (id: string) => void;
			};
		};

		// IAB interfaces - only one should be present at a time
		__uspapi?: (
			command: string,
			version: number,
			callback: (tcData: CCPAData | undefined, success: boolean) => void,
		) => void;
		__tcfapi?: (
			command: string,
			version: number,
			callback: (tcData: TCData, success: boolean) => void,
			vendorIDs?: number[],
		) => void;
	}
}
