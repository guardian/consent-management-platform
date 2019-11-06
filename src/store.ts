import { ConsentString } from 'consent-string';
import { GuPurposeState, IabPurposeState } from './types';
import { readIabCookie, readLegacyCookie } from './cookies';

type onStateChangeFn = (
    guState: GuPurposeState,
    iabState: IabPurposeState,
) => void;

// TODO: These defaults should be switched to null once the PECR purposes are activated
let guState: GuPurposeState = { functional: true, performance: true };
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
    init();
    guState = newGuState;
    iabState = newIabState;

    // const allowedPurposes = Object.keys(iabState)
    //     .filter(key => iabState[parseInt(key, 10)])
    //     .map(purpose => parseInt(purpose, 10));

    // const allowedVendors = iabVendorList.vendors.map(vendor => vendor.id);

    // const consentData = new ConsentString();
    // consentData.setGlobalVendorList(iabVendorList);
    // consentData.setCmpId(IAB_CMP_ID);
    // consentData.setCmpVersion(IAB_CMP_VERSION);
    // consentData.setConsentScreen(IAB_CONSENT_SCREEN);
    // consentData.setConsentLanguage(IAB_CONSENT_LANGUAGE);
    // consentData.setPurposesAllowed(allowedPurposes);
    // consentData.setVendorsAllowed(allowedVendors);

    // const iabStr = consentData.getConsentString();
    // const pAdvertisingState = allowedPurposes.length === 5

    // TODO: Call writeStateCookies here
    // TODO: Call postConsentState here

    onStateChange.forEach((callback: onStateChangeFn): void => {
        callback(guState, iabState);
    });
};

const getGuStateFromCookie = (): GuPurposeState => {
    // TODO: Friendly reminder to update the getConsentState() unit tests after PECR is introduced
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

const resetModule = () => {
    guState = { functional: true, performance: true };
    iabState = { 1: null, 2: null, 3: null, 4: null, 5: null };
    onStateChange.length = 0;
    initialised = false;
};

export { getConsentState, setConsentState, registerStateChangeHandler };

export const _ = {
    resetModule,
};
