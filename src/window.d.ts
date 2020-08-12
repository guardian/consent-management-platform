import {
	PubData,
	SourcePointChoiceType,
	CCPAData,
	TCFData,
	VendorConsents,
} from './types';

declare global {
	interface Window {
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
					onMessageChoiceSelect: (
						arg0: number,
						arg1: SourcePointChoiceType,
					) => void;
				};
			};
			loadPrivacyManagerModal?: (unknown: unknown, id: string) => {}; // this function is undocumented
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
						arg1: SourcePointChoiceType,
					) => void;
				};
			};
			loadPrivacyManagerModal?: (id: number) => {};
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
			callback: (
				tcData: TCFData | VendorConsents | undefined,
				success: boolean,
			) => void,
			vendorIDs?: number[],
		) => void;
	}
}

// globals set on the window by the CMP library
// interface Window {

// }
