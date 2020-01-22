import * as Cookies from 'js-cookie';
import {
    readBwidCookie,
    readGuCookie,
    readIabCookie,
    readLegacyCookie,
    writeStateCookies,
    _,
} from './cookies';

const {
    BWID_COOKIE_NAME,
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
    LEGACY_COOKIE_NAME,
} = _;

const OriginalDate = global.Date;

jest.mock('js-cookie', () => ({
    set: jest.fn(),
    get: jest.fn(),
    getJSON: jest.fn(),
}));

describe('Cookies', () => {
    const guConsentState = {
        foo: true,
        bar: false,
    };
    const guCookie = {
        version: GU_COOKIE_VERSION,
        state: guConsentState,
    };
    const cookieOptions = {
        domain: '.theguardian.com',
        expires: COOKIE_MAX_AGE,
    };
    const iabConsentString = 'heL10W0rLd';
    const fakeNow = '12345';

    beforeAll(() => {
        global.Date = {
            now: () => fakeNow,
        };
        Object.defineProperty(document, 'domain', {
            value: 'www.theguardian.com',
        });
    });

    afterAll(() => {
        global.Date = OriginalDate;
        expect(Date.now()).not.toMatch(fakeNow);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('should trigger the saving correctly if', () => {
        beforeAll(() => {
            Cookies.set.mockImplementation(() => undefined);
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        // TODO: update test when PECR purposes introduced
        it('all states provided', () => {
            writeStateCookies(guConsentState, iabConsentString);

            // expect(Cookies.set).toHaveBeenCalledTimes(2);
            expect(Cookies.set).toHaveBeenCalledTimes(1);
            // expect(Cookies.set).toHaveBeenNthCalledWith(
            //     1,
            //     GU_COOKIE_NAME,
            //     guCookie,
            //     cookieOptions,
            // );
            expect(Cookies.set).toHaveBeenLastCalledWith(
                IAB_COOKIE_NAME,
                iabConsentString,
                cookieOptions,
            );
        });

        it('guState is not provided', () => {
            writeStateCookies({}, iabConsentString);

            expect(Cookies.set).toHaveBeenCalledTimes(1);
            expect(Cookies.set).toHaveBeenLastCalledWith(
                IAB_COOKIE_NAME,
                iabConsentString,
                cookieOptions,
            );
        });
    });

    describe('should be able to set', () => {
        // TODO: update test when PECR purposes introduced
        it('the GU cookie', () => {
            writeStateCookies(guConsentState, iabConsentString);

            // expect(Cookies.set).toHaveBeenNthCalledWith(
            //     1,
            //     GU_COOKIE_NAME,
            //     guCookie,
            //     cookieOptions,
            // );
        });

        // TODO: update test when PECR purposes introduced
        it('the IAB cookie', () => {
            writeStateCookies(guConsentState, iabConsentString);

            expect(Cookies.set).toHaveBeenNthCalledWith(
                1,
                IAB_COOKIE_NAME,
                iabConsentString,
                cookieOptions,
            );
        });
    });

    describe('should be able to read', () => {
        it('the bwid cookie', () => {
            const fakeBwid = 'foo';
            Cookies.get.mockImplementation(() => fakeBwid);

            const readCookie = readBwidCookie();

            expect(Cookies.get).toHaveBeenCalledTimes(1);
            expect(Cookies.get).toHaveBeenCalledWith(BWID_COOKIE_NAME);
            expect(readCookie).toBe(fakeBwid);
        });

        it('the GU cookie', () => {
            Cookies.getJSON.mockImplementation(() => guCookie);

            const readCookie = readGuCookie();

            expect(Cookies.getJSON).toHaveBeenCalledTimes(1);
            expect(Cookies.getJSON).toHaveBeenCalledWith(GU_COOKIE_NAME);
            expect(readCookie).toBe(guConsentState);
        });

        it('the IAB cookie', () => {
            Cookies.get.mockImplementation(() => iabConsentString);

            const readCookie = readIabCookie();

            expect(Cookies.get).toHaveBeenCalledTimes(1);
            expect(Cookies.get).toHaveBeenCalledWith(IAB_COOKIE_NAME);
            expect(readCookie).toBe(iabConsentString);
        });

        it('the legacy cookie', () => {});

        const fakeCookieValue = 'foo';
        Cookies.get.mockImplementation(() => fakeCookieValue);

        const readCookie = readLegacyCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(LEGACY_COOKIE_NAME);
        expect(readCookie).toBe(fakeCookieValue);
    });

    describe('returns null when reading cookies', () => {
        it('if no GU cookie exists', () => {
            Cookies.getJSON.mockImplementation(() => undefined);

            const readCookie = readGuCookie();

            expect(Cookies.getJSON).toHaveBeenCalledTimes(1);
            expect(Cookies.getJSON).toHaveBeenCalledWith(GU_COOKIE_NAME);
            expect(readCookie).toBeNull();
        });

        it('if no IAB cookie exists', () => {
            Cookies.get.mockImplementation(() => undefined);

            const readCookie = readIabCookie();

            expect(Cookies.get).toHaveBeenCalledTimes(1);
            expect(Cookies.get).toHaveBeenCalledWith(IAB_COOKIE_NAME);
            expect(readCookie).toBeNull();
        });

        it('if no legacy cookie exists', () => {
            Cookies.get.mockImplementation(() => undefined);

            const readCookie = readLegacyCookie();

            expect(Cookies.get).toHaveBeenCalledTimes(1);
            expect(Cookies.get).toHaveBeenCalledWith(LEGACY_COOKIE_NAME);
            expect(readCookie).toBeNull();
        });
    });
});
