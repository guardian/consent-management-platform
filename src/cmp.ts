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
import { GU_PURPOSE_LIST } from './config';
import { readIabCookie, readLegacyCookie } from './cookies';

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

const getLegacyStateFromCookie = (): IabPurposeState => {
    const cookie = readLegacyCookie();
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
        getIabStateFromCookie() || getLegacyStateFromCookie();

    triggerConsentNotification();
};

const checkCmpReady = (): void => {
    if (cmpIsReady) {
        return;
    }

    setStateFromCookies();

    cmpIsReady = true;
};

export const updateStateOnSave = (latestIabState: IabPurposeState): void => {
    iabPurposeRegister.state = latestIabState;

    triggerConsentNotification();
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
    updateStateOnSave,
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
