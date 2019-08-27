import * as _Cookies from 'js-cookie';
import {
    readGuCookie,
    readIabCookie,
    writeGuCookie,
    writeIabCookie,
    _,
} from './cookies';

const Cookies = _Cookies;

const { GU_COOKIE_NAME, IAB_COOKIE_NAME, COOKIE_MAX_AGE } = _;

jest.mock('js-cookie', () => ({
    set: jest.fn(),
    get: jest.fn(),
}));

describe('Cookies', () => {
    const consentState = {
        foo: true,
        bar: false,
    };
    const cookieOptions = {
        domain: '.theguardian.com',
        expires: COOKIE_MAX_AGE,
    };

    beforeAll(() => {
        Object.defineProperty(document, 'domain', {
            value: 'www.theguardian.com',
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be able to set the GU cookie', () => {
        writeGuCookie(consentState);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            GU_COOKIE_NAME,
            consentState,
            cookieOptions,
        );
    });

    it('should be able to set the IAB cookie', () => {
        writeIabCookie(consentState);

        expect(Cookies.set).toHaveBeenCalledTimes(1);
        expect(Cookies.set).toHaveBeenCalledWith(
            IAB_COOKIE_NAME,
            consentState,
            cookieOptions,
        );
    });

    it('should be able to read the GU cookie', () => {
        readGuCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(GU_COOKIE_NAME);
    });

    it('should be able to read the IAB cookie', () => {
        readIabCookie();

        expect(Cookies.get).toHaveBeenCalledTimes(1);
        expect(Cookies.get).toHaveBeenCalledWith(IAB_COOKIE_NAME);
    });
});
