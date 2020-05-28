import {
    init as initSourcepoint,
    onIabConsentNotification as ccpaOnIabConsentNotification,
} from './ccpa';

import { onIabConsentNotification as tcfOnIabConsentNotification } from './tcf/core';

let ccpa = false;

export const init = ({ useCCPA = false } = {}) => {
    if (useCCPA) {
        initSourcepoint();
        ccpa = true;
    }
};

export const onIabConsentNotification = _ =>
    ccpa ? tcfOnIabConsentNotification(_) : ccpaOnIabConsentNotification(_);

export { setErrorHandler } from './tcf/error';
export { shouldShow } from './tcf/cmp-ui';
export { onGuConsentNotification } from './tcf/core';
