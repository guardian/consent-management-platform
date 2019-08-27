import * as Cookies from 'js-cookie';

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

const addCookie = (name: string, value: string, daysToLive?: number): void => {
    const options: {
        domain: string;
        expires?: number;
    } = {
        domain: getDomainAttribute(),
    };

    if (daysToLive) {
        options.expires = daysToLive;
    }

    Cookies.set(name, value, options);
};

const getCookie = (name: string): string | void => Cookies.get(name);

export { addCookie, getCookie };
