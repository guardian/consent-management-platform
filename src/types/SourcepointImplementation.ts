import { PubData } from './PubData';
import { WillShowPrivacyMessage } from './WillShowPrivacyMessage';

export interface SourcepointImplementation {
	init: (pubData?: PubData) => void;
	willShowPrivacyMessage: WillShowPrivacyMessage;
	showPrivacyManager: () => void;
}
