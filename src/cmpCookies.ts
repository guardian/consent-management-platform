import { getCookie, setCookie, setSessionCookie } from '@guardian/libs';
import type { ConsentUseCases } from './types/consentUseCases';
import { hasConsentForUseCase } from './hasConsentForUseCase';

//TODO: Write wrappers for the other cookie functions in @guardian/libs

export const cmpGetCookie = async({ useCase, name, shouldMemoize, }: {
	useCase: ConsentUseCases,
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
	useCase: ConsentUseCases,
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

export const cmpSetSessionCookie = async ({ useCase, name, value }: {
	useCase: ConsentUseCases,
    name: string;
    value: string;
}): Promise<void> =>
{
	console.log('in cmpSetSessionCookie');

	if(await hasConsentForUseCase(useCase))
	{
		setSessionCookie({name:name, value:value})
	}
	else
	{
		console.error('cmp', `Cannot set cookie ${name} due to missing consent for use-case ${useCase}`)
	}
};
