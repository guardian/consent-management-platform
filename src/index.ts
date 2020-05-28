import { init as initSourcepoint } from './sourcepoint';

export const init = () => {
    initSourcepoint();
};

export { onGuConsentNotification, onIabConsentNotification } from './core';
export { setErrorHandler } from './error';
export { shouldShow } from './cmp-ui';
