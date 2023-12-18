import { storage } from '@guardian/libs';
import { onConsent } from '.';

export const UseCaseOptions = [
	"Targeted advertising",
	"Essential"
] as const;
export type UseCases = typeof UseCaseOptions[number];

export const cmpGetLocalStorageItem = async (useCase: UseCases, localStorageItem: string): Promise<unknown> =>
{
	//console.log('in cmpGetLocalStorageItem');
	const consentState = await onConsent();

	/*console.log(`consentState.tcfv2?.consents['1']: ${consentState.tcfv2?.consents['1']}`);
	console.log(`consentState.tcfv2?.consents['2']: ${consentState.tcfv2?.consents['2']}`);
	console.log(`consentState.tcfv2?.consents['3']: ${consentState.tcfv2?.consents['3']}`);
	console.log(`consentState.tcfv2?.consents['4']: ${consentState.tcfv2?.consents['4']}`);
	console.log(`consentState.tcfv2?.consents['5']: ${consentState.tcfv2?.consents['5']}`);
	console.log(`consentState.tcfv2?.consents['6']: ${consentState.tcfv2?.consents['6']}`);
	console.log(`consentState.tcfv2?.consents['7']: ${consentState.tcfv2?.consents['7']}`);
	console.log(`consentState.tcfv2?.consents['8']: ${consentState.tcfv2?.consents['8']}`);
	console.log(`consentState.tcfv2?.consents['9']: ${consentState.tcfv2?.consents['9']}`);
	console.log(`consentState.tcfv2?.consents['10']: ${consentState.tcfv2?.consents['10']}`);
	console.log(`consentState.tcfv2?.consents['11']: ${consentState.tcfv2?.consents['11']}`);
	console.log(`consentState.canTarget: ${consentState.canTarget}`);
	*/

 	switch(useCase) {
		case "Targeted advertising": {
			if (
				consentState.canTarget //could be more granular than this, for example by using explicit tcf purposes:
				//(consentState.tcfv2?.consents['1']
				//	&& consentState.tcfv2.consents['2']
				//	&& consentState.tcfv2.consents['3'])//Need the correct list of consents, this is just an example
				//|| (!consentState.ccpa?.doNotSell)
				//|| (consentState.aus?.personalisedAdvertising)
				)
				{
					return storage.local.get(localStorageItem)
				}
				else
				{
					console.error('cmp', `Cannot get local storage item ${localStorageItem} due to missing consent for use-case ${useCase}`)
					return(null)
				}
 		}
 		case "Essential": return(storage.local.get(localStorageItem))
		default: {
			console.error('cmp', `Cannot get local storage item ${localStorageItem} due to unknown use-case ${useCase}`)
			return(null)
		}
	}
};

export const cmpSetLocalStorageItem = async (useCase: UseCases, localStorageItem: string, value:unknown, expires?: string | number | Date): Promise<void> =>
{
	//console.log('in cmpSetLocalStorageItem');
	const consentState = await onConsent();

 	switch(useCase) {
		case "Targeted advertising": {
			if (
				consentState.canTarget //could be more granular than this, for example by using explicit tcf purposes:
				//(consentState.tcfv2?.consents['1']
				//	&& consentState.tcfv2.consents['2']
				//	&& consentState.tcfv2.consents['3'])//Need the correct list of consents, this is just an example
				//|| (!consentState.ccpa?.doNotSell)
				//|| (consentState.aus?.personalisedAdvertising)
				)
				{
					storage.local.set(localStorageItem, value, expires)
				}
				else
				{
					console.error('cmp', `Cannot set local storage item ${localStorageItem} due to missing consent for use-case ${useCase}`)
				}
 		}
 		case "Essential": storage.local.set(localStorageItem, value, expires)
		default: console.error('cmp', `Cannot set local storage item ${localStorageItem} due to unknown use-case ${useCase}`)
	};
};


//await cmpGetLocalStorageItem("Targeted advertising", "dep")
//await cmpGetLocalStorageItem("invalid", "dep")
