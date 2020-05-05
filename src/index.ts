import { stub } from './sourcepoint.stub';
import { lib } from './sourcepoint.lib';

declare global {
    interface Window {
        _sp_: { config: {} };
    }
}

type InitProps = {
    id: string;
};

export const init = ({ id }: InitProps) => {
    document.head.appendChild(stub);

    // make sure nothing else on the page has accidentally
    // used the _sp_ name as well
    if (window._sp_) {
        throw new Error('Sourcepoint global (window._sp_) is already defined!');
    }

    window._sp_ = {
        config: {
            accountId: id,
            wrapperAPIOrigin: 'https://wrapper-api.sp-prod.net/tcfv2',
            mmsDomain: 'https://message.sp-prod.net',
        },
    };

    document.body.appendChild(lib);
};
