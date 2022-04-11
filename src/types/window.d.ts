import type { getConsentFor } from '../getConsentFor';
import type { getEnhancedConsent } from '../getEnhancedConsent';
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
			getEnhancedConsent?: typeof getEnhancedConsent;
		};
		// *************** END commercial.dcr.js hotfix ***************

		// sourcepoint's libraries - only one should be present at a time
		_sp_ccpa?: {
			config: {
				baseEndpoint: EndPoint;
				accountId: number;
				getDnsMsgMms: boolean;
				alwaysDisplayDns: boolean;
				siteHref: Property;
				targetingParams: {
					framework: 'ccpa' | 'aus';
				};
				pubData: PubData;
				events?: {
					onConsentReady: () => void;
					onMessageReady: () => void;
					onMessageReceiveData: (data: {
						msg_id: 0 | string;
					}) => void;
					onMessageChoiceSelect: OnMessageChoiceSelect;
				};
			};
			loadPrivacyManagerModal?: (unknown: unknown, id: string) => void; // this function is undocumented
		};
		_sp_?: {
			config: {
				baseEndpoint: EndPoint;
				accountId: number;
				propertyHref: Property;
				propertyId?: string;
				targetingParams: {
					framework: 'tcfv2';
				};
				pubData: PubData;
				events?: {
					onConsentReady: () => void;
					onMessageReady: () => void;
					onMessageReceiveData: (data: {
						messageId: 0 | string;
					}) => void;
					onMessageChoiceSelect: OnMessageChoiceSelect;
				};
			};
			loadPrivacyManagerModal?: (id: number) => void;
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
