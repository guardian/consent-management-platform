import { ConsentString } from 'consent-string';
import { GuPurposeState, IabPurposeState } from './types';
import { readIabCookie, readLegacyCookie } from './cookies';

type onStateChangeFn = (
    guState: GuPurposeState,
    iabState: IabPurposeState,
) => void;

let guState: GuPurposeState = { functional: null, performance: null };
let iabState: IabPurposeState = { 1: null, 2: null, 3: null, 4: null, 5: null };

const onStateChange: onStateChangeFn[] = [];
let initialised = false;

const init = (): void => {
    if (!initialised) {
        guState = getGuStateFromCookie();
        iabState = getIabStateFromCookie();
        initialised = true;
    }
};

const registerStateChangeHandler = (callback: onStateChangeFn): void => {
    init();
    onStateChange.push(callback);
    callback(guState, iabState);
};

const getConsentState = (): {
    guState: GuPurposeState;
    iabState: IabPurposeState;
} => {
    init();
    return { guState, iabState };
};

const setConsentState = (
    newGuState: GuPurposeState,
    newIabState: IabPurposeState,
): void => {
    guState = newGuState;
    iabState = newIabState;

    // TODO: Call writeStateCookies here

    onStateChange.forEach((callback: onStateChangeFn): void => {
        callback(guState, iabState);
    });
};

const getGuStateFromCookie = (): GuPurposeState => {
    return { functional: true, performance: true };
};

const getIabStateFromCookie = (): IabPurposeState => {
    const iabCookie = readIabCookie();
    const newIabState: IabPurposeState = {};

    if (iabCookie) {
        const iabData = new ConsentString(iabCookie);

        Object.keys(iabState).forEach((key: string): void => {
            const purposeId = parseInt(key, 10);
            newIabState[purposeId] = iabData.isPurposeAllowed(purposeId);
        });

        return newIabState;
    }

    const legacyCookie = readLegacyCookie();

    if (legacyCookie) {
        const legacyConsentState: boolean = legacyCookie.split('.')[0] === '1';

        Object.keys(iabState).forEach((key: string): void => {
            const purposeId = parseInt(key, 10);
            newIabState[purposeId] = legacyConsentState;
        });

        return newIabState;
    }

    Object.keys(iabState).forEach((key: string): void => {
        const purposeId = parseInt(key, 10);
        newIabState[purposeId] = null;
    });

    return newIabState;
};

export { getConsentState, setConsentState, registerStateChangeHandler };
