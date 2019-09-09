import * as Cookies from 'js-cookie';
import { GuCookie, GuPurposeState } from './types';
import {
    GU_COOKIE_NAME,
    GU_COOKIE_VERSION,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
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

const writeGuCookie = (guState: GuPurposeState): void =>
    addCookie(GU_COOKIE_NAME, { version: GU_COOKIE_VERSION, state: guState });

const writeIabCookie = (iabString: string): void =>
    addCookie(IAB_COOKIE_NAME, iabString);

export { readGuCookie, readIabCookie, writeGuCookie, writeIabCookie };
