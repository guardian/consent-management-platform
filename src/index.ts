import { stub } from './sourcepoint.stub';
import { lib } from './sourcepoint.lib';

declare global {
    interface Window {
        _sp_: { config: {} };
    }
}

interface Props {
    accountId: string | number;
    siteHref?: string;
    propertyId?: string;
    targetingParams?: {
        [param: string]: string | number;
    };
    events?: {
        // needs fleshing out
        // https://documentation.sourcepoint.com/web-implementation/sourcepoint-set-up-and-configuration-v2/optional-callbacks
        [eventName: string]: () => {};
    };
}

export const init = ({ accountId }: Props) => {
    document.head.appendChild(stub);

    // make sure nothing else on the page has accidentally
    // used the _sp_ name as well
    if (window._sp_) {
        throw new Error('Sourcepoint global (window._sp_) is already defined!');
    }

    // https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support-beta/gdpr-and-tcf-v2-setup-and-configuration#1-two-step-process-to-implement-the-gdpr-and-tcf-v2-code-snippet
    window._sp_ = {
        config: {
            accountId,
            wrapperAPIOrigin: 'https://wrapper-api.sp-prod.net/tcfv2',
            mmsDomain: `https://message${accountId}.sp-prod.net`,
        },
    };

    document.body.appendChild(lib);
};
