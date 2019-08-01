// subset of https://github.com/guzzle/guzzle/pull/1131
const isValidCookieValue = (name: string): boolean =>
    !/[()<>@,;"\\/[\]?={} \t]/g.test(name);

const getShortDomain = (isCrossSubdomain: boolean = false): string => {
    const domain = document.domain || '';

    if (domain === 'localhost') {
        return domain;
    }

    // Trim any possible subdomain (will be shared with supporter, identity, etc)
    if (isCrossSubdomain) {
        return ['', ...domain.split('.').slice(-2)].join('.');
    }
    // Trim subdomains for prod (www.theguardian), code (m.code.dev-theguardian) and dev (dev.theguardian, m.thegulocal)
    return domain.replace(/^(www|m\.code|dev|m)\./, '.');
};

const getDomainAttribute = (isCrossSubdomain: boolean = false): string => {
    const shortDomain = getShortDomain(isCrossSubdomain);
    return shortDomain === 'localhost' ? '' : ` domain=${shortDomain};`;
};

const addCookie = (
    name: string,
    value: string,
    daysToLive?: number,
    isCrossSubdomain: boolean = true,
): void => {
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

    document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute(
        isCrossSubdomain,
    )}`;
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
