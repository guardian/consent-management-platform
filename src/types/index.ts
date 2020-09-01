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
