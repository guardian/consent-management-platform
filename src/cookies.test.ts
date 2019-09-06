import * as _Cookies from 'js-cookie';
import {
    readGuCookie,
    readIabCookie,
    writeGuCookie,
    writeIabCookie,
} from './cookies';
import {
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
} from './config';

const Cookies = _Cookies;

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

    beforeAll(() => {
        Object.defineProperty(document, 'domain', {
            value: 'www.theguardian.com',
        });
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
});
