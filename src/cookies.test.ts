import * as Cookies from 'js-cookie';
import {
    readGuCookie,
    readIabCookie,
    readLegacyCookie,
    writeStateCookies,
    writeGuCookie,
    writeIabCookie,
    writeLegacyCookie,
} from './cookies';
import {
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
    LEGACY_COOKIE_NAME,
} from './config';

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

    it('should be able to set the GU cookie', () => {
        writeGuCookie(guConsentState);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            GU_COOKIE_NAME,
            guCookie,
            cookieOptions,
        );
    });

    it('should be able to set the IAB cookie', () => {
        writeIabCookie(iabConsentString);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            IAB_COOKIE_NAME,
            iabConsentString,
            cookieOptions,
        );
    });

    it('should be able to set the legacy cookie to true', () => {
        writeLegacyCookie(true);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            LEGACY_COOKIE_NAME,
            `1.${fakeNow}`,
            cookieOptions,
        );
    });

    it('should be able to set the legacy cookie to true', () => {
        writeLegacyCookie(false);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            LEGACY_COOKIE_NAME,
            `0.${fakeNow}`,
            cookieOptions,
        );
    });

    it('should be able to read the GU cookie', () => {
        Cookies.getJSON.mockImplementation(() => guCookie);

        const readCookie = readGuCookie();

        expect(Cookies.getJSON).toHaveBeenCalledTimes(1);
        expect(Cookies.getJSON).toHaveBeenCalledWith(GU_COOKIE_NAME);
        expect(readCookie).toBe(guConsentState);
    });

    it('should be able to read the IAB cookie', () => {
        Cookies.get.mockImplementation(() => iabConsentString);

        const readCookie = readIabCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(IAB_COOKIE_NAME);
        expect(readCookie).toBe(iabConsentString);
    });

    it('should be able to read the legacy cookie', () => {
        const fakeCookieValue = 'foo';
        Cookies.get.mockImplementation(() => fakeCookieValue);

        const readCookie = readLegacyCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(LEGACY_COOKIE_NAME);
        expect(readCookie).toBe(fakeCookieValue);
    });

    it('returns null if no GU cookie', () => {
        Cookies.getJSON.mockImplementation(() => undefined);

        const readCookie = readGuCookie();

        expect(Cookies.getJSON).toHaveBeenCalledTimes(1);
        expect(Cookies.getJSON).toHaveBeenCalledWith(GU_COOKIE_NAME);
        expect(readCookie).toBeNull();
    });

    it('returns null if no IAB cookie', () => {
        Cookies.get.mockImplementation(() => undefined);

        const readCookie = readIabCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(IAB_COOKIE_NAME);
        expect(readCookie).toBeNull();
    });

    it('returns null if no legacy cookie', () => {
        Cookies.get.mockImplementation(() => undefined);

        const readCookie = readLegacyCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(LEGACY_COOKIE_NAME);
        expect(readCookie).toBeNull();
    });

    describe(' should trigger the saving correctly if', () => {
        beforeAll(() => {
            Cookies.set.mockImplementation(() => undefined);
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('all states provided', () => {
            writeStateCookies(guConsentState, iabConsentString, true);

            expect(Cookies.set).toHaveBeenCalledTimes(3);
            expect(Cookies.set).toHaveBeenNthCalledWith(
                1,
                LEGACY_COOKIE_NAME,
                `1.${fakeNow}`,
                cookieOptions,
            );
            expect(Cookies.set).toHaveBeenNthCalledWith(
                2,
                GU_COOKIE_NAME,
                guCookie,
                cookieOptions,
            );
            expect(Cookies.set).toHaveBeenLastCalledWith(
                IAB_COOKIE_NAME,
                iabConsentString,
                cookieOptions,
            );
        });
        it('legacyState is not provided', () => {
            writeStateCookies(guConsentState, iabConsentString);

            expect(Cookies.set).toHaveBeenCalledTimes(2);
            expect(Cookies.set).toHaveBeenNthCalledWith(
                1,
                GU_COOKIE_NAME,
                guCookie,
                cookieOptions,
            );
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
});
