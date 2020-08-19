export interface PubData {
	browserId?: string;
}

export interface SourcepointImplementation {
	init: (pubData?: PubData) => void;
	willShowPrivacyMessage: WillShowPrivacyMessage;
	showPrivacyManager: () => void;
}

export type WillShowPrivacyMessage = () => Promise<boolean>;
