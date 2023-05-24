import { initVendorDataManager } from './vendorDataManager';
import { onConsentChange } from './onConsentChange';
import { removeCookie, storage } from '@guardian/libs';
import { vendorLocalStorageData, vendorCookieData } from './vendorStorageIds';
import { Callback, ConsentState } from './types';
import { TCFv2ConsentState } from './types/tcfv2';

jest.mock('./onConsentChange');

const tcfv2ConsentState: TCFv2ConsentState = {
	consents: { 1: true },
	eventStatus: 'tcloaded',
	vendorConsents: {
		'5fa51b29a228638b4a1980e4': true, // ipsos
		'5e98e7f1b8e05c111d01b462': false, // criteo
	},
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

jest.mock('./vendors', () => ({
	VendorIDs: {
		criteo: ['5e98e7f1b8e05c111d01b462'],
		ipsos: ['5fa51b29a228638b4a1980e4'],
	},
}));

jest.mock('./vendorStorageIds', () => ({
	vendorCookieData: {
		criteo: ['criteoCookie1', 'criteoCookie2'],
		ipsos: ['ipsosCookie1', 'ipsosCookie2'],
	},
	vendorLocalStorageData: {
		criteo: ['criteoLocalStorage1', 'criteoLocalStorage2'],
		ipsos: ['ipsosLocalStorage1', 'ipsosLocalStorage2'],
	},
}));

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

jest.mock('@guardian/libs', () => ({
	removeCookie: jest.fn(),
	storage: {
		local: {
			remove: jest.fn(),
		},
		session: {
			remove: jest.fn(),
		},
	},
}));

describe('initVendorDataManager', () => {
	it('should remove cookies and localStorage data only for vendors that the user has not consented to', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: true,
			framework: 'tcfv2',
		};

		mockOnConsentChange(consentState);

		initVendorDataManager();

		vendorCookieData.criteo.forEach((name) => {
			expect(removeCookie).toHaveBeenCalledWith({ name });
		});

		vendorCookieData.ipsos.forEach((name) => {
			expect(removeCookie).not.toHaveBeenCalledWith({ name });
		});

		vendorLocalStorageData.criteo.forEach((name) => {
			expect(storage.local.remove).toHaveBeenCalledWith(name);
			expect(storage.session.remove).toHaveBeenCalledWith(name);
		});

		vendorLocalStorageData.ipsos.forEach((name) => {
			expect(storage.local.remove).not.toHaveBeenCalledWith(name);
			expect(storage.session.remove).not.toHaveBeenCalledWith(name);
		});
	});
});
