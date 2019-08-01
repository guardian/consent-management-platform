// subset of https://github.com/guzzle/guzzle/pull/1131
const isValidCookieValue = (name: string): boolean =>
    !/[()<>@,;"\\/[\]?={} \t]/g.test(name);

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
    return shortDomain === 'localhost' ? '' : ` domain=${shortDomain};`;
};

const addCookie = (name: string, value: string, daysToLive?: number): void => {
    const expires = new Date();

    if (!isValidCookieValue(name) || !isValidCookieValue(value)) {
        return;
    }

    if (daysToLive) {
        expires.setDate(expires.getDate() + daysToLive);
    } else {
        expires.setMonth(expires.getMonth() + 5);
        expires.setDate(1);
    }

    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
};

const getCookieValues = (name: string): string[] => {
    const nameEq = `${name}=`;
    const cookies = document.cookie.split(';');

    return cookies.reduce((acc: string[], cookie: string): string[] => {
        const cookieTrimmed = cookie.trim();

        if (cookieTrimmed.indexOf(nameEq) === 0) {
            acc.push(
                cookieTrimmed.substring(nameEq.length, cookieTrimmed.length),
            );
        }

        return acc;
    }, []);
};

const getCookie = (name: string): string | null => {
    const cookieVal = getCookieValues(name);

    if (cookieVal.length > 0) {
        return cookieVal[0];
    }

    return null;
};

export { addCookie, getCookie };

// Export for testing purposes
export const _ = {
    isValidCookieValue,
};
