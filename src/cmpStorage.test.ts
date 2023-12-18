import { onConsentChange } from './onConsentChange';
import type { Callback, ConsentState } from './types';
import type { TCFv2ConsentState } from './types/tcfv2';
import {hasConsentForUseCase} from './cmpStorage';

jest.mock('./onConsentChange');

const tcfv2ConsentState: TCFv2ConsentState = {
	consents: { 1: true },
	eventStatus: 'tcloaded',
	vendorConsents: {
		['5efefe25b8e05c06542b2a77']: true,
	},
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const tcfv2ConsentStateNoConsent: TCFv2ConsentState = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: {},
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

describe('cmpStorage.hasConsentForUseCase returns the expected consent', () => {
	test('Targeted advertising when canTarget is true', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: true,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await hasConsentForUseCase('Targeted advertising');
		expect(hasConsent).toEqual(true);
	});
	test('Targeted advertising when canTarget is false', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: false,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await hasConsentForUseCase('Targeted advertising');
		expect(hasConsent).toEqual(false);
	});
	test('Targeted advertising when canTarget is true', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: true,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await hasConsentForUseCase('Targeted advertising');
		expect(hasConsent).toEqual(true);
	});
	test('Essential when no consents', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentStateNoConsent,
			canTarget: false,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await hasConsentForUseCase('Essential');
		expect(hasConsent).toEqual(true);
	});
});
