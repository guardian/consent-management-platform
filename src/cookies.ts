import * as Cookies from 'js-cookie';
import { GU_COOKIE_NAME, IAB_COOKIE_NAME, COOKIE_MAX_AGE } from './config';

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

const addCookie = (name: string, value: string | GuPurposeState): void => {
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

    return cookie || null;
};

const readIabCookie = (): string | null => {
    const cookie = Cookies.get(IAB_COOKIE_NAME);

    return cookie || null;
};

const writeGuCookie = (guState: GuPurposeState): void =>
    addCookie(GU_COOKIE_NAME, guState);

const writeIabCookie = (iabString: string): void =>
    addCookie(IAB_COOKIE_NAME, iabString);

export { readGuCookie, readIabCookie, writeGuCookie, writeIabCookie };
