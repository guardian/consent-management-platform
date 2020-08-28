import { ConsentList } from './ConsentList';
import { TCEventStatusCode } from './TCEventStatusCode';

export interface TCFv2ConsentState {
	consents: ConsentList;
	eventStatus: TCEventStatusCode;
	vendorConsents: ConsentList;
}
