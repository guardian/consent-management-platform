import { distinctUntilChanged, mergeMap, ReplaySubject, Subject } from 'rxjs';
import { getConsentState as getAUSConsentState } from './aus/getConsentState';
import { getConsentState as getCCPAConsentState } from './ccpa/getConsentState';
import { getCurrentFramework } from './getCurrentFramework';
import { getConsentState as getTCFv2ConsentState } from './tcfv2/getConsentState';
import type { Callback, ConsentState } from './types';

const interactionSubject = new Subject<void>();
const cmpInteraction = (): void => {
	interactionSubject.next();
};

const getConsentState: () => Promise<ConsentState> = async () => {
	switch (getCurrentFramework()) {
		case 'aus':
			return { aus: await getAUSConsentState() };
		case 'ccpa':
			return { ccpa: await getCCPAConsentState() };
		case 'tcfv2':
			return { tcfv2: await getTCFv2ConsentState() };
		default:
			throw new Error('no IAB consent framework found on the page');
	}
};

let consentState = new ReplaySubject<ConsentState>(1);

interactionSubject
	.pipe(mergeMap(async () => await getConsentState()))
	.subscribe((state) => {
		consentState.next(state);
	});

const onConsentChange = (callback: Callback): void => {
	consentState
		.pipe(
			distinctUntilChanged(
				(prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
			),
		)
		.subscribe(callback);
};

export { cmpInteraction, onConsentChange };

export const _ = {
	getConsentState,
	resetConsentState: (): void => {
		consentState = new ReplaySubject<ConsentState>();
	},
};
