import { GuPurposeList } from './types';

const isRunningOnProd = (): boolean => {
    if (typeof document === 'undefined') {
        return false;
    }

    const domain = document.domain || '';
    const shortDomain = domain
        .split('.')
        .slice(-2)
        .join('.');

    return shortDomain === 'theguardian.com';
};

const isProd = isRunningOnProd();

const cmpDomain = (): string =>
    isProd
        ? 'https://manage.theguardian.com'
        : 'https://manage.code.dev-theguardian.com';

const iabVendorListUrl = (): string =>
    isProd
        ? 'https://www.theguardian.com/commercial/cmp/vendorlist.json'
        : 'https://code.dev-theguardian.com/commercial/cmp/vendorlist.json';

export const CMP_DOMAIN = cmpDomain();
export const CMP_URL = `${CMP_DOMAIN}/consent`;
export const COOKIE_MAX_AGE = 395; // 13 months
export const GU_AD_CONSENT_COOKIE = 'GU_TK';
export const GU_COOKIE_NAME = 'guconsent';
export const GU_COOKIE_VERSION = 1;
export const IAB_VENDOR_LIST_URL = iabVendorListUrl();
export const IAB_COOKIE_NAME = 'euconsent';
export const IAB_CMP_ID = 112;
export const IAB_CMP_VERSION = 1;
export const IAB_CONSENT_SCREEN = 0;
export const IAB_CONSENT_LANGUAGE = 'en';
export const CMP_READY_MSG = 'readyCmp';
export const CMP_SAVED_MSG = 'savedCmp';
export const CMP_CLOSE_MSG = 'closeCmp';
export const GU_PURPOSE_LIST: GuPurposeList = {
    purposes: [
        {
            id: 0,
            name: 'Essential',
            eventId: 'essential',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            integrations: [
                {
                    name: 'Ophan',
                    policyUrl: 'https://www.theguardian.com/info/privacy',
                },
                {
                    name: 'Confiant',
                    policyUrl: 'https://www.confiant.com/privacy',
                },
            ],
            alwaysEnabled: true,
        },
        {
            id: 1,
            name: 'Functional',
            eventId: 'functional',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis malesuada ante.',
            integrations: [
                {
                    name: 'Pinterest',
                    policyUrl: 'https://policy.pinterest.com/',
                },
            ],
        },
        {
            id: 2,
            name: 'Performance',
            eventId: 'performance',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis malesuada ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
            integrations: [
                {
                    name: 'Sentry',
                    policyUrl: 'https://sentry.io/privacy/',
                },
                {
                    name: 'Google Analytics',
                    policyUrl: 'https://policies.google.com/privacy?hl=en-US',
                },
            ],
        },
    ],
};
