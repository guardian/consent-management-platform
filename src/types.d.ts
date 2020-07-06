declare module '@iabtcf/stub';

interface UspData {
	version: number;
	uspString: string;
}

interface SourcepointImplementation {
	init: () => void;
	willShowPrivacyMessage: () => Promise<boolean>;
	showPrivacyManager: () => void;
}

type SourcepointMessageReceiveData = {
	message_url?: string;
	msg_id: 0 | string;
	prtn_uuid?: string;
	msg_desc?: string;
	cmpgn_id?: string;
	bucket?: string;
	uuid?: string;
};

// globals set on the window by the CMP library
interface Window {
	// sourcepoint's libraries - only one should be present at a time
	_sp_ccpa?: {
		config: {
			mmsDomain: 'https://consent.theguardian.com';
			ccpaOrigin: 'https://ccpa-service.sp-prod.net';
			accountId: string;
			getDnsMsgMms: boolean;
			alwaysDisplayDns: boolean;
			siteHref: string | null;
			events?: {
				onConsentReady?: () => void;
				onMessageReady?: () => void;
				onMessageReceiveData?: (data: SourcepointMessageReceiveData) => void;
			};
		};
		loadPrivacyManagerModal?: (unknown: unknown, id: string) => {}; // this function is undocumented
	};
	_sp_?: {
		config: {
			mmsDomain: 'https://consent.theguardian.com';
			wrapperAPIOrigin: 'https://wrapper-api.sp-prod.net/tcfv2';
			accountId: string;
			propertyHref: string | null;
			propertyId?: string;
			targetingParams?: {
				[key: string]: string;
			};
			events?: {
				onConsentReady?: () => void;
				onMessageReady?: () => void;
				onMessageReceiveData?: (data: SourcepointMessageReceiveData) => void;
			};
		};
		loadPrivacyManagerModal?: (id: number) => {}; // this function is undocumented
	};

	// IAB interfaces - only one should be present at a time
	__uspapi?: (
		command: string,
		version: number,
		callback: (uspdata: UspData | undefined, success: boolean) => void,
	) => void;
	__tcfapi?: (
		command: string,
		version: number,
		callback: (uspdata: UspData | undefined, success: boolean) => void,
		vendorIDs?: number[],
	) => void;
}
