import * as Cookies from 'js-cookie';
import { Purpose, PurposeCallback, PurposeEvent, ItemState } from './types';
import { CMP_DOMAIN, CMP_SAVED_MSG, GU_AD_CONSENT_COOKIE } from './config';

let cmpIsReady = false;

const purposes: { [key in PurposeEvent]: Purpose } = {
    functional: {
        state: null,
        callbacks: [],
    },
    performance: {
        state: null,
        callbacks: [],
    },
    advertisement: {
        state: null,
        callbacks: [],
    },
};

const triggerConsentNotification = (): void => {
    Object.keys(purposes).forEach((key: string): void => {
        const purpose = purposes[key as PurposeEvent];
        purpose.callbacks.forEach((callback: PurposeCallback): void =>
            callback(purpose.state),
        );
    });
};

const receiveMessage = (event: MessageEvent): void => {
    const { origin, data } = event;

    // triggerConsentNotification when CMP_SAVED_MSG emitted from CMP_DOMAIN
    if (origin === CMP_DOMAIN && data === CMP_SAVED_MSG) {
        triggerConsentNotification();
    }
};

const getAdConsentState = (): ItemState => {
    const cookie = Cookies.get(GU_AD_CONSENT_COOKIE);

    if (!cookie) {
        return null;
    }

    const cookieParsed = cookie.split('.')[0];

    if (cookieParsed === '1') {
        return true;
    }

    if (cookieParsed === '0') {
        return false;
    }

    return null;
};

const checkCmpReady = (): void => {
    if (cmpIsReady) {
        return;
    }

    /**
     * These state assignments are temporary
     * and will eventually be replaced by values
     * read from the CMP cookie.
     * */
    purposes.functional.state = true;
    purposes.performance.state = true;
    purposes.advertisement.state = getAdConsentState();

    // listen for postMessage events from CMP UI
    window.addEventListener('message', receiveMessage, false);

    cmpIsReady = true;
};

export const onConsentNotification = (
    purposeName: PurposeEvent,
    callback: PurposeCallback,
): void => {
    checkCmpReady();

    const purpose = purposes[purposeName];

    callback(purpose.state);

    purpose.callbacks.push(callback);
};

// Exposed for testing purposes
export const _ = {
    triggerConsentNotification,
    resetCmp: (): void => {
        cmpIsReady = false;
        Object.keys(purposes).forEach((key: string): void => {
            const purpose = purposes[key as PurposeEvent];
            purpose.state = null;
            purpose.callbacks = [];
        });
    },
};
