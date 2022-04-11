import { getEnhancedConsent } from './getEnhancedConsent';
import type { ConsentStateEnhanced } from './getEnhancedConsent';
import { onConsentChange } from './onConsentChange';
import type { Callback, ConsentState } from './types';
import type { AUSConsentState } from './types/aus';
import type { CCPAConsentState } from './types/ccpa';
import type { TCFv2ConsentState } from './types/tcfv2';

jest.mock('./onConsentChange');

const tcfv2ConsentState: TCFv2ConsentState = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: {
		['5efefe25b8e05c06542b2a77']: true,
	},
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const ccpaConsentState: CCPAConsentState = {
	doNotSell: false,
};

const ausConsentState: AUSConsentState = {
	personalisedAdvertising: true,
};

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

describe('getInitialConsentState', () => {
	test('tcfv2 with event-status not equal to `cmpuishown` resolves immediately', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
		};
		const expectedEnhancedConsentState: ConsentStateEnhanced = {
			...consentState,
			canTarget: false,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getEnhancedConsent();
		expect(resolvedConsentState).toEqual(expectedEnhancedConsentState);
	});
	test('ccpa resolves immediately', async () => {
		const consentState: ConsentState = {
			ccpa: ccpaConsentState,
		};
		const expectedEnhancedConsentState: ConsentStateEnhanced = {
			...consentState,
			canTarget: true,
			framework: 'ccpa',
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getEnhancedConsent();
		expect(resolvedConsentState).toEqual(expectedEnhancedConsentState);
	});
	test('aus resolves immediately', async () => {
		const consentState: ConsentState = {
			aus: ausConsentState,
		};
		const expectedEnhancedConsentState: ConsentStateEnhanced = {
			...consentState,
			canTarget: true,
			framework: 'aus',
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getEnhancedConsent();
		expect(resolvedConsentState).toEqual(expectedEnhancedConsentState);
	});
	test('unknown region rejects', async () => {
		mockOnConsentChange({});
		await expect(getEnhancedConsent()).rejects.toEqual('Unknown framework');
	});
});
