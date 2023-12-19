import { onConsentChange } from './onConsentChange';
import type { Callback, ConsentState } from './types';
import type { TCFv2ConsentState } from './types/tcfv2';
import {cmpGetLocalStorageItem, cmpSetLocalStorageItem, cmpGetSessionStorageItem, cmpSetSessionStorageItem, cmpGetCookie, cmpSetCookie, _private } from './cmpStorage';
import { getCookie as getCookie_, setCookie as setCookie_, storage as storageStub} from '@guardian/libs';

jest.mock('./onConsentChange');
jest.mock('@guardian/libs', () => ({
    getCookie: jest.fn(),
	setCookie: jest.fn(),
	storage: {
        local: {
            get: jest.fn(),
            set: jest.fn(),
        },
		session: {
            get: jest.fn(),
            set: jest.fn(),
        },
    }
}));

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
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) => cb(consentState));

describe('cmpStorage.hasConsentForUseCase returns the expected consent', () => {
	test('Targeted advertising has consent when canTarget is true', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: true,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await _private.hasConsentForUseCase('Targeted advertising');
		expect(hasConsent).toEqual(true);
	});
	test('Targeted advertising has no consent when canTarget is false', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: false,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await _private.hasConsentForUseCase('Targeted advertising');
		expect(hasConsent).toEqual(false);
	});
	test('Essential has consent even when ConsentState has no consents', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentStateNoConsent,
			canTarget: false,
			framework: 'tcfv2',
		};
		mockOnConsentChange(consentState);
		const hasConsent = await _private.hasConsentForUseCase('Essential');
		expect(hasConsent).toEqual(true);
	});
});


describe('local storage returns the expected consent', () => {
	let mockContains:any;

	beforeEach(() => {
        mockContains = 'someTestData';

        (storageStub.local.get as jest.Mock).mockImplementation((key:string) => {
            if (key === 'gu.mock') {return mockContains}
			else {return(null)}
        });

        (storageStub.local.set as jest.Mock).mockImplementation((key:string, data:unknown) => {
            if (key === 'gu.mock') {mockContains = data;}
        });
    });

    test('Targeted advertising get local storage returns null when canTarget is false', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
        const localStorageValue = await cmpGetLocalStorageItem('Targeted advertising', 'gu.mock');
        expect(localStorageValue).toEqual(null);
    });
	test('Targeted advertising can set and get local storage value when canTarget is true', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: true,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const localStorageValueDefault = await cmpGetLocalStorageItem('Targeted advertising', 'gu.mock');
        expect(localStorageValueDefault).toEqual('someTestData');
		await cmpSetLocalStorageItem('Essential', 'gu.mock', 'testdataAd');
        const localStorageValue = await cmpGetLocalStorageItem('Targeted advertising', 'gu.mock');
        expect(localStorageValue).toEqual('testdataAd');
    });
    test('Essential can set and get local storage when no consents', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const localStorageValueDefault = await cmpGetLocalStorageItem('Essential', 'gu.mock');
        expect(localStorageValueDefault).toEqual('someTestData');
        await cmpSetLocalStorageItem('Essential', 'gu.mock', 'testdata');
		const localStorageValue = await cmpGetLocalStorageItem('Essential', 'gu.mock');
        expect(localStorageValue).toEqual('testdata');
    });
	test('get null if local storage item does not exist', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const localStorageValue = await cmpGetLocalStorageItem('Essential', 'gu.does_not_exist');
        expect(localStorageValue).toEqual(null);
    });
});


describe('session storage returns the expected consent', () => {
	let mockContains:any;

	beforeEach(() => {
        mockContains = 'someTestData';

        (storageStub.session.get as jest.Mock).mockImplementation((key:string) => {
            if (key === 'gu.mock') {return mockContains}
			else {return(null)}
        });

        (storageStub.session.set as jest.Mock).mockImplementation((key:string, data:unknown) => {
            if (key === 'gu.mock') {mockContains = data;}
        });
    });

    test('Targeted advertising get session storage returns null when canTarget is false', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
        const sessionStorageValue = await cmpGetSessionStorageItem('Targeted advertising', 'gu.mock');
        expect(sessionStorageValue).toEqual(null);
    });
	test('Targeted advertising can set and get session storage value when canTarget is true', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: true,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const sessionStorageValueDefault = await cmpGetSessionStorageItem('Targeted advertising', 'gu.mock');
        expect(sessionStorageValueDefault).toEqual('someTestData');
		await cmpSetSessionStorageItem('Essential', 'gu.mock', 'testdataAd');
        const sessionStorageValue = await cmpGetSessionStorageItem('Targeted advertising', 'gu.mock');
        expect(sessionStorageValue).toEqual('testdataAd');
    });
    test('Essential can set and get session storage when no consents', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const sessionStorageValueDefault = await cmpGetSessionStorageItem('Essential', 'gu.mock');
        expect(sessionStorageValueDefault).toEqual('someTestData');
        await cmpSetSessionStorageItem('Essential', 'gu.mock', 'testdata');
		const sessionStorageValue = await cmpGetSessionStorageItem('Essential', 'gu.mock');
        expect(sessionStorageValue).toEqual('testdata');
    });
	test('get null if session storage item does not exist', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const sessionStorageValue = await cmpGetSessionStorageItem('Essential', 'gu.does_not_exist');
        expect(sessionStorageValue).toEqual(null);
    });
});


describe('cookies return the expected consent', () => {
	let mockContains:any;

	beforeEach(() => {
        mockContains = 'someTestData';

        (getCookie_ as jest.Mock).mockImplementation(({name }: {
			name: string;
		}) => {
			if (name === 'gu.mock') {return mockContains}
			else {return(null)}
        });

        (setCookie_ as jest.Mock).mockImplementation(({ name, value }: {
			name: string;
			value: string;
		}) => {
            if (name === 'gu.mock') {mockContains = value;}
        });
    });

    test('Targeted advertising get cookie returns null when canTarget is false', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
        const cookieValue = await cmpGetCookie({useCase: 'Targeted advertising', name: 'gu.mock'});
        expect(cookieValue).toEqual(null);
    });
	test('Targeted advertising can set and get cookies when canTarget is true', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentState,
            canTarget: true,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const cookieValueDefault = await cmpGetCookie({useCase: 'Targeted advertising', name: 'gu.mock'});
        expect(cookieValueDefault).toEqual('someTestData');
		await cmpSetCookie({useCase: 'Essential', name: 'gu.mock', value: 'testdataAd'});
        const cookieValue = await cmpGetCookie({useCase: 'Targeted advertising', name: 'gu.mock'});
        expect(cookieValue).toEqual('testdataAd');
    });
    test('Essential can set and get cookies when no consents', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const cookieValueDefault = await cmpGetCookie({useCase: 'Essential', name:'gu.mock'});
        expect(cookieValueDefault).toEqual('someTestData');
        await cmpSetCookie({useCase: 'Essential', name: 'gu.mock', value: 'testdata'});
		const cookieValue = await cmpGetCookie({useCase: 'Essential', name: 'gu.mock'});
        expect(cookieValue).toEqual('testdata');
    });
	test('get null if cookie does not exist', async () => {
        const consentState: ConsentState = {
            tcfv2: tcfv2ConsentStateNoConsent,
            canTarget: false,
            framework: 'tcfv2',
        };
        mockOnConsentChange(consentState);
		const cookieValue = await cmpGetCookie({useCase: 'Essential', name: 'gu.does_not_exist'});
        expect(cookieValue).toEqual(null);
    });
});
