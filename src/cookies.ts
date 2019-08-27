import * as Cookies from 'js-cookie';

const GU_COOKIE_NAME = 'guconsent';
const IAB_COOKIE_NAME = 'euconsent';
const COOKIE_MAX_AGE = 395; // 13 months

const getShortDomain = (): string => {
    const domain = document.domain || '';

    if (domain === 'localhost') {
        return domain;
    }

    // Trim any possible subdomain (will be shared with supporter, identity, etc)
    return ['', ...domain.split('.').slice(-2)].join('.');
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

const getCookie = (name: string): string | undefined => Cookies.get(name);

const readGuCookie = (): GuPurposeState | null => {
    const cookie = getCookie(GU_COOKIE_NAME);

    if (!cookie) {
        return null;
    }

    return JSON.parse(cookie);
};

const readIabCookie = (): string | null => {
    const cookie = getCookie(IAB_COOKIE_NAME);

    if (!cookie) {
        return null;
    }

    return cookie;
};

const writeGuCookie = (guState: GuPurposeState): void =>
    addCookie(GU_COOKIE_NAME, guState);

const writeIabCookie = (iabString: string): void =>
    addCookie(IAB_COOKIE_NAME, iabString);

export { readGuCookie, readIabCookie, writeGuCookie, writeIabCookie };

// exposed for testing purpose
export const _ = {
    GU_COOKIE_NAME,
    IAB_COOKIE_NAME,
    COOKIE_MAX_AGE,
};
