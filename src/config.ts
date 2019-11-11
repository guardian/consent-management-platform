import { GuPurposeList } from './types';

export const isProd = (): boolean => {
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
