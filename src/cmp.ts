import * as Cookies from 'js-cookie';
import { ConsentString } from 'consent-string';
import {
    GuPurposeCallback,
    GuResponsivePurposeEventId,
    GuPurpose,
    GuPurposeRegister,
    IabPurposeCallback,
    IabPurposeRegister,
    IabPurposeState,
    ItemState,
} from './types';
import {
    CMP_DOMAIN,
    CMP_SAVED_MSG,
    GU_AD_CONSENT_COOKIE,
    GU_PURPOSE_LIST,
} from './config';
import { readIabCookie } from './cookies';

let cmpIsReady = false;

const buildGuPurposeRegister = (): GuPurposeRegister => {
    const { purposes } = GU_PURPOSE_LIST;

    const purposeRegister = purposes.reduce(
        (register, purpose: GuPurpose): {} => {
            if (purpose.alwaysEnabled) {
                return register;
            }

            return {
                ...register,
                [purpose.eventId]: {
                    state: null,
                    callbacks: [],
                },
            };
        },
        {},
    );

    return purposeRegister as GuPurposeRegister;
};

const guPurposeRegister: GuPurposeRegister = buildGuPurposeRegister();

const iabPurposeRegister: IabPurposeRegister = {
    state: {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
    },
    callbacks: [],
};

const triggerConsentNotification = (): void => {
    // Iterate over guPurposeRegister callbacks
    Object.keys(guPurposeRegister).forEach((key: string): void => {
        const guPurpose = guPurposeRegister[key as GuResponsivePurposeEventId];
        guPurpose.callbacks.forEach((callback: GuPurposeCallback): void =>
            callback(guPurpose.state),
        );
    });
    // Iterate over iabPurposeRegister callbacks
    iabPurposeRegister.callbacks.forEach(
        (callback: IabPurposeCallback): void => {
            callback(iabPurposeRegister.state);
        },
    );
};

const getIabStateFromCookie = (): IabPurposeState | null => {
    const cookie = readIabCookie();

    if (!cookie) {
        return null;
    }

    const iabState = {
        ...iabPurposeRegister.state,
    };

    const iabData = new ConsentString(cookie);

    Object.keys(iabState).forEach((key: string): void => {
        const purposeId = parseInt(key, 10);
        iabState[purposeId] = iabData.isPurposeAllowed(purposeId);
    });

    return iabState;
};

const getGuTkStateFromCookie = (): IabPurposeState => {
    const cookie = Cookies.get(GU_AD_CONSENT_COOKIE);
    const iabState = {
        ...iabPurposeRegister.state,
    };
    let adConsentState: ItemState = null;

    if (cookie) {
        const cookieParsed = cookie.split('.')[0];

        if (cookieParsed === '1') {
            adConsentState = true;
        }

        if (cookieParsed === '0') {
            adConsentState = false;
        }
    }

    Object.keys(iabState).forEach((key: string): void => {
        iabState[parseInt(key, 10)] = adConsentState;
    });

    return iabState;
};

const setStateFromCookies = (): void => {
    /**
     * These state assignments are temporary
     * and will eventually be replaced by values
     * read from the CMP cookie.
     * */
    guPurposeRegister.functional.state = true;
    guPurposeRegister.performance.state = true;
    iabPurposeRegister.state =
        getIabStateFromCookie() || getGuTkStateFromCookie();

    triggerConsentNotification();
};

const receiveMessage = (event: MessageEvent): void => {
    const { origin, data } = event;

    // triggerConsentNotification when CMP_SAVED_MSG emitted from CMP_DOMAIN
    if (origin === CMP_DOMAIN && data === CMP_SAVED_MSG) {
        setStateFromCookies();
    }
};

const checkCmpReady = (): void => {
    if (cmpIsReady) {
        return;
    }

    setStateFromCookies();

    // listen for postMessage events from CMP UI
    window.addEventListener('message', receiveMessage, false);

    cmpIsReady = true;
};

export const onIabConsentNotification = (
    callback: IabPurposeCallback,
): void => {
    checkCmpReady();

    callback(iabPurposeRegister.state);

    iabPurposeRegister.callbacks.push(callback);
};

export const onGuConsentNotification = (
    purposeName: GuResponsivePurposeEventId,
    callback: GuPurposeCallback,
): void => {
    checkCmpReady();

    const guPurpose = guPurposeRegister[purposeName];

    if (guPurpose) {
        callback(guPurpose.state);

        guPurpose.callbacks.push(callback);
    }
};

// Exposed for testing
export const _ = {
    triggerConsentNotification,
    resetCmp: (): void => {
        cmpIsReady = false;
        // reset guPurposeRegister
        Object.keys(guPurposeRegister).forEach((key: string): void => {
            const guPurpose =
                guPurposeRegister[key as GuResponsivePurposeEventId];

            guPurpose.state = null;
            guPurpose.callbacks = [];
        });
        // reset iabPurposeRegister
        iabPurposeRegister.state = {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
        };
        iabPurposeRegister.callbacks = [];
    },
};
