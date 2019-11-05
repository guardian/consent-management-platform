// import * as Cookies from 'js-cookie';
import Cookies from 'js-cookie';
import { GuCookie, GuPurposeState } from './types';
import {
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
    LEGACY_COOKIE_NAME,
} from './config';

const getShortDomain = (): string => {
    const domain = document.domain || '';

    return domain === 'localhost'
        ? domain
        : ['', ...domain.split('.').slice(-2)].join('.');
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

const writeGuCookie = (guState: GuPurposeState): void =>
    addCookie(GU_COOKIE_NAME, { version: GU_COOKIE_VERSION, state: guState });

const writeIabCookie = (iabString: string): void =>
    addCookie(IAB_COOKIE_NAME, iabString);

const writeLegacyCookie = (state: boolean): void =>
    addCookie(LEGACY_COOKIE_NAME, [state ? '1' : '0', Date.now()].join('.'));

const writeStateCookies = (
    guState: GuPurposeState,
    iabString: string,
    legacyState?: boolean,
): void => {
    if (typeof legacyState !== 'undefined') {
        writeLegacyCookie(legacyState);
    }
    if (Object.keys(guState).length > 0) {
        writeGuCookie(guState);
    }
    writeIabCookie(iabString);

    // TODO: trigger logging here
};

export {
    readGuCookie,
    readIabCookie,
    readLegacyCookie,
    writeStateCookies,
    writeGuCookie,
    writeIabCookie,
    writeLegacyCookie,
};
