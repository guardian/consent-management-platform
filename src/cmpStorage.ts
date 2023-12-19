import { storage, getCookie, setCookie } from '@guardian/libs';
import { onConsent } from './onConsent';

export const UseCaseOptions = [
	"Targeted advertising",
	"Essential"
] as const;
export type UseCases = typeof UseCaseOptions[number];

export const hasConsentForUseCase = async (useCase: UseCases): Promise<boolean> =>
{
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
		case "Targeted advertising": return(consentState.canTarget)
			//could be more granular than this, for example by using explicit tcf purposes:
			//(consentState.tcfv2?.consents['1']
			//	&& consentState.tcfv2.consents['2']
			//	&& consentState.tcfv2.consents['3'])//Need the correct list of consents, this is just an example
			//|| (!consentState.ccpa?.doNotSell)
			//|| (consentState.aus?.personalisedAdvertising)
 		case "Essential": return(true) //could check for allow-list of essential cookies/storage here in the future
		default: return(false) //do I need this line given that use-case is essentially an enum?
	}

}

export const cmpGetLocalStorageItem = async (useCase: UseCases, storageItem: string): Promise<unknown> =>
{
	console.log('in cmpGetLocalStorageItem');

 	if(await hasConsentForUseCase(useCase))
	{
		return storage.local.get(storageItem)
	}
	else
	{
		console.error('cmp', `Cannot get local storage item ${storageItem} due to missing consent for use-case ${useCase}`)
		return(null)
	}
};

export const cmpSetLocalStorageItem = async (useCase: UseCases, storageItem: string, value:unknown, expires?: string | number | Date): Promise<void> =>
{
	console.log('in cmpSetLocalStorageItem');

	if(await hasConsentForUseCase(useCase))
	{
		return storage.local.set(storageItem, value, expires)
	}
	else
	{
		console.error('cmp', `Cannot set local storage item ${storageItem} due to missing consent for use-case ${useCase}`)
	}
};

export const cmpGetSessionStorageItem = async (useCase: UseCases, storageItem: string): Promise<unknown> =>
{
	console.log('in cmpGetSessionStorageItem');

	if(await hasConsentForUseCase(useCase))
	{
		return storage.session.get(storageItem)
	}
	else
	{
		console.error('cmp', `Cannot get session storage item ${storageItem} due to missing consent for use-case ${useCase}`)
		return(null)
	}
};

export const cmpSetSessionStorageItem = async (useCase: UseCases, storageItem: string, value:unknown, expires?: string | number | Date): Promise<void> =>
{
	console.log('in cmpSetSessionStorageItem');

	if(await hasConsentForUseCase(useCase))
	{
		return storage.session.set(storageItem, value, expires)
	}
	else
	{
		console.error('cmp', `Cannot set session storage item ${storageItem} due to missing consent for use-case ${useCase}`)
	}
};

export const cmpGetCookie = async({ useCase, name, shouldMemoize, }: {
	useCase: UseCases,
	name: string;
	shouldMemoize?: boolean | undefined;
}): Promise<string | null> =>
{
	console.log('in cmpGetCookie');

	if(await hasConsentForUseCase(useCase))
	{
		return getCookie({name: name, shouldMemoize: shouldMemoize})
	}
	else
	{
		console.error('cmp', `Cannot get cookie ${name} due to missing consent for use-case ${useCase}`)
		return(null)
	}
};

export const cmpSetCookie = async ({ useCase, name, value, daysToLive, isCrossSubdomain, }: {
	useCase: UseCases,
    name: string;
    value: string;
    daysToLive?: number | undefined;
    isCrossSubdomain?: boolean | undefined;
}): Promise<void> =>
{
	console.log('in cmpSetCookie');

	if(await hasConsentForUseCase(useCase))
	{
		setCookie({name:name, value:value, daysToLive:daysToLive, isCrossSubdomain:isCrossSubdomain})
	}
	else
	{
		console.error('cmp', `Cannot set cookie ${name} due to missing consent for use-case ${useCase}`)
	}
};

//await cmpGetLocalStorageItem("Targeted advertising", "dep")
//await cmpGetLocalStorageItem("invalid", "dep")
