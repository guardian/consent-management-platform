/* eslint-disable no-underscore-dangle */
import { getConsentFor } from './getConsentFor';

const consentStateNotFound = {
	tcfv2: { vendorConsents: { doesnotexist: true } },
};

const consentStateFoundTrue = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': true } },
};

const consentStateFoundfalse = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': false } },
};

it('throws an error if no consent for the vendor found ', () => {
	expect(getConsentFor('google-analytics', consentStateNotFound)).toThrow(
		'Consent not found for vendor google-analytics',
	);
});

it('returns consent if true', () => {
	expect(getConsentFor('google-analytics', consentStateFoundTrue)).toBeTruthy();
});

it('returns consent if false', () => {
	expect(getConsentFor('google-analytics', consentStateFoundfalse)).toBeFalsy();
});
