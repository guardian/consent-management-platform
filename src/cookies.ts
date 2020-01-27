// import * as Cookies from 'js-cookie';
import Cookies from 'js-cookie';
import { GuCookie, GuPurposeState } from './types';

declare global {
    interface Window {
        guardian?: { config?: { page?: { isPreview?: boolean } } };
    }
}

const GU_COOKIE_NAME = 'guconsent';
const IAB_COOKIE_NAME = 'euconsent';
const LEGACY_COOKIE_NAME = 'GU_TK';
const BWID_COOKIE_NAME = 'bwid';
const GU_COOKIE_VERSION = 1;
const COOKIE_MAX_AGE = 395; // 13 months

const getShortDomain = (): string => {
    const domain = document.domain || '';

    const slice = domain.endsWith('co.uk') ? -3 : -2;

    return domain === 'localhost'
        ? domain
        : ['', ...domain.split('.').slice(slice)].join('.');
};

const getDomainAttribute = (): string => {
    const shortDomain = getShortDomain();

    return shortDomain === 'localhost' ? '' : shortDomain;
};

const addCookie = (name: string, value: string | GuCookie): void => {
    const options: {
        domain: string;
        expires: number;
    } = {
        domain: getDomainAttribute(),
        expires: COOKIE_MAX_AGE,
    };

    Cookies.set(name, value, options);
};

const readBwidCookie = (): string | null => {
    const cookie = Cookies.get(BWID_COOKIE_NAME);

    return cookie || null;
};

const readGuCookie = (): GuPurposeState | null => {
    const cookie = Cookies.getJSON(GU_COOKIE_NAME);

    if (cookie) {
        if (cookie.version === 1) {
            return cookie.state || null;
        }
    }

    return null;
};

const readIabCookie = (): string | null => {
    const cookie = Cookies.get(IAB_COOKIE_NAME);

    return cookie || null;
};

const readLegacyCookie = (): string | null => {
    const cookie = Cookies.get(LEGACY_COOKIE_NAME);

    return cookie || null;
};

// eslint-disable-next-line
const writeGuCookie = (guState: GuPurposeState): void => {
    // TODO: enable saving on GU Cookie when PECR purposes introduced
    // addCookie(GU_COOKIE_NAME, { version: GU_COOKIE_VERSION, state: guState });
};

const writeIabCookie = (iabString: string): void =>
    addCookie(IAB_COOKIE_NAME, iabString);

const writeStateCookies = (
    guState: GuPurposeState,
    iabString: string,
): void => {
    if (Object.keys(guState).length > 0) {
        writeGuCookie(guState);
    }
    writeIabCookie(iabString);

    // TODO: trigger logging here
};

export {
    readBwidCookie,
    readGuCookie,
    readIabCookie,
    readLegacyCookie,
    writeStateCookies,
};

export const _ = {
    BWID_COOKIE_NAME,
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
    LEGACY_COOKIE_NAME,
};
