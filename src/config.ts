export const CMP_DOMAIN = 'https://manage.theguardian.com';
export const COOKIE_MAX_AGE = 395; // 13 months
export const GU_AD_CONSENT_COOKIE = 'GU_TK';
export const GU_COOKIE_NAME = 'guconsent';
export const IAB_VENDOR_LIST_URL =
    'https://assets.guim.co.uk/data/vendor/4f4a6324c7fe376c17ceb2288a84a076/cmp_vendorlist.json';
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
            hideRadio: true,
        },
        {
            id: 1,
            name: 'Functional',
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
