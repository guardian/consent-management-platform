import { storage } from '@guardian/libs';
import { onConsent } from '.';

export const UseCaseOptions = [
	"Targeted advertising",
	"Essential"
] as const;
export type UseCases = typeof UseCaseOptions[number];

export const cmpGetLocalStorageItem = async (localStorageItem: string, useCase: UseCases): Promise<unknown> =>
{
	console.log('in cmpGetLocalStorageItem');
	const consentState = await onConsent();
 	switch(useCase) {
		case "Targeted advertising": {
			if (
				(consentState.tcfv2?.consents['1'] && consentState.tcfv2.consents['3'])
				|| (!consentState.ccpa?.doNotSell)
				|| (consentState.aus?.personalisedAdvertising) )
				{
					console.log(`localStorage.getItem(localStorageItem): ${localStorage.getItem(localStorageItem)}`);
					return storage.local.get(localStorageItem)
				}
				else
				{
					console.log('in else')
					return(null)
				}
 		}
 		case "Essential": return(localStorage.getItem(localStorageItem))
		default: return(null)
	}
};


//await cmpGetLocalStorageItem("dep", "Targeted advertising")
//await cmpGetLocalStorageItem("dep", "invalid")
