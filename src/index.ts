import { init as initSourcepoint } from './ccpa';

export const init = () => {
    initSourcepoint();
};

export { onGuConsentNotification, onIabConsentNotification } from './tcf/core';
export { setErrorHandler } from './tcf/error';
export { shouldShow } from './tcf/cmp-ui';
