/* eslint-disable no-underscore-dangle */
import { getConsentFor } from './getConsentFor';

const tcfv2ConsentNotFound = {
	tcfv2: { vendorConsents: { doesnotexist: true } },
};

const tcfv2ConsentFoundTrue = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': true } },
};

const tcfv2ConsentFoundFalse = {
	tcfv2: { vendorConsents: { '5e542b3a4cd8884eb41b5a72': false } },
};

const ccpaWithConsent = { ccpa: { doNotSell: false } };

const ccpaWithoutConsent = { ccpa: { doNotSell: true } };

it('throws an error if the vendor found ', () => {
	expect(() => {
		getConsentFor('doesnotexist', tcfv2ConsentFoundTrue);
	}).toThrow("Vendor 'doesnotexist' not found");
});

it('throws an error if no tcfv2 consent found for specific vendor ', () => {
	expect(getConsentFor('google-analytics', tcfv2ConsentNotFound)).toBeFalsy();
});

it('returns true tcfv2 consent if true', () => {
	expect(getConsentFor('google-analytics', tcfv2ConsentFoundTrue)).toBeTruthy();
});

it('returns false tcfv2 consent if false', () => {
	expect(getConsentFor('google-analytics', tcfv2ConsentFoundFalse)).toBeFalsy();
});

it('returns true ccpa consent if true', () => {
	expect(getConsentFor('google-analytics', ccpaWithConsent)).toBeTruthy();
});

it('returns false ccpa consent if false', () => {
	expect(getConsentFor('google-analytics', ccpaWithoutConsent)).toBeFalsy();
});
