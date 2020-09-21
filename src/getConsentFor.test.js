/* eslint-disable no-underscore-dangle */
import { getConsentFor } from './getConsentFor';

const consentStateNotFound = {
	tcfv2: { vendorConsents: { doesnotexist: true } },
};

const consentStateFoundTrue = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': true } },
};

const consentStateFoundFalse = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': false } },
};

it('throws an error if the vendor found ', () => {
	expect(() => {
		getConsentFor('doesnotexist', consentStateFoundTrue);
	}).toThrow();
});

it('throws an error if no consent found for specific vendor ', () => {
	expect(() => {
		getConsentFor('google-analytics', consentStateNotFound);
	}).toThrow();
});

it('returns true consent if true', () => {
	expect(getConsentFor('google-analytics', consentStateFoundTrue)).toBeTruthy();
});

it('returns false consent if false', () => {
	expect(getConsentFor('google-analytics', consentStateFoundFalse)).toBeFalsy();
});
