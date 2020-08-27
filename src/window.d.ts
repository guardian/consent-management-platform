import { PubData } from './types';
import { CCPAData } from './ccpa/types/CCPAData';
import { TCData } from './tcfv2/types/TCData';

declare global {
	interface Window {
		// *************** START commercial.dcr.js hotfix ***************
		guCmpHotFix?: {
			initialised?: boolean;
			cmp?: {
				init: ({
					pubData,
					isInUsa,
				}: {
					pubData?: PubData | undefined;
					isInUsa: boolean;
				}) => void;
				willShowPrivacyMessage: () => Promise<boolean | undefined>;
				showPrivacyManager: () => void;
			};
			onConsentChange?: unknown;
		};
		// *************** END commercial.dcr.js hotfix ***************

		// sourcepoint's libraries - only one should be present at a time
		_sp_ccpa?: {
			config: {
				mmsDomain: 'https://consent.theguardian.com';
				ccpaOrigin: 'https://ccpa-service.sp-prod.net';
				accountId: number;
				getDnsMsgMms: boolean;
				alwaysDisplayDns: boolean;
				siteHref: string | null;
				targetingParams: {
					framework: 'ccpa';
				};
				pubData: PubData;
				events?: {
					onConsentReady: () => void;
					onMessageReady: () => void;
					onMessageReceiveData: (data: { msg_id: 0 | string }) => void;
				};
			};
			loadPrivacyManagerModal?: (unknown: unknown, id: string) => void; // this function is undocumented
		};
		_sp_?: {
			config: {
				mmsDomain: 'https://consent.theguardian.com';
				wrapperAPIOrigin: 'https://wrapper-api.sp-prod.net/tcfv2';
				accountId: number;
				propertyHref: string | null;
				propertyId?: string;
				targetingParams: {
					framework: 'tcfv2';
				};
				pubData: PubData;
				events?: {
					onConsentReady: () => void;
					onMessageReady: () => void;
					onMessageReceiveData: (data: { messageId: 0 | string }) => void;
					onMessageChoiceSelect: (
						arg0: number,
						arg1: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
					) => void;
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
