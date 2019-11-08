import { ConsentString } from 'consent-string';
import {
    GuPurposeState,
    IabPurposeState,
    IabVendorList,
    GuPurposeList,
} from './types';
import { readIabCookie, readLegacyCookie, writeStateCookies } from './cookies';
import { GU_PURPOSE_LIST, isProd } from './config';
import { postConsentState } from './logs';

type onStateChangeFn = (
    guState: GuPurposeState,
    iabState: IabPurposeState,
) => void;

const IAB_CMP_ID = 112;
const IAB_CMP_VERSION = 1;
const IAB_CONSENT_SCREEN = 0;
const IAB_CONSENT_LANGUAGE = 'en';
const IAB_VENDOR_LIST_PROD_URL =
    'https://www.theguardian.com/commercial/cmp/vendorlist.json';
const IAB_VENDOR_LIST_NOT_PROD_URL =
    'https://code.dev-theguardian.com/commercial/cmp/vendorlist.json';
const onStateChange: onStateChangeFn[] = [];

// TODO: These defaults should be switched to null once the PECR purposes are activated
let guState: GuPurposeState = { functional: true, performance: true };
let iabState: IabPurposeState = { 1: null, 2: null, 3: null, 4: null, 5: null };

let vendorListPromise: Promise<IabVendorList>;
let initialised = false;

const init = (): void => {
    if (!initialised) {
        const IAB_VENDOR_LIST_URL = isProd()
            ? IAB_VENDOR_LIST_PROD_URL
            : IAB_VENDOR_LIST_NOT_PROD_URL;

        vendorListPromise = fetch(IAB_VENDOR_LIST_URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(`${response.status} | ${response.statusText}`);
            })
            .catch(error => {
                // eslint-disable-next-line no-console
                console.log('Error fetching vendor list: ', error);
            });

        guState = getGuStateFromCookie();
        iabState = getIabStateFromCookie();
        initialised = true;
    }
};

const getVendorList = (): Promise<IabVendorList> => {
    init();
    return vendorListPromise;
};

const getGuPurposeList = (): GuPurposeList => {
    init();
    return GU_PURPOSE_LIST;
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
): Promise<void> => {
    init();
    guState = newGuState;
    iabState = newIabState;

    return getVendorList()
        .then(iabVendorList => {
            const allowedPurposes = Object.keys(iabState)
                .filter(key => iabState[parseInt(key, 10)])
                .map(purpose => parseInt(purpose, 10));

            const allowedVendors = iabVendorList.vendors.map(
                vendor => vendor.id,
            );

            const consentData = new ConsentString();

            consentData.setGlobalVendorList(iabVendorList);
            consentData.setCmpId(IAB_CMP_ID);
            consentData.setCmpVersion(IAB_CMP_VERSION);
            consentData.setConsentScreen(IAB_CONSENT_SCREEN);
            consentData.setConsentLanguage(IAB_CONSENT_LANGUAGE);
            consentData.setPurposesAllowed(allowedPurposes);
            consentData.setVendorsAllowed(allowedVendors);

            const iabStr = consentData.getConsentString();
            const pAdvertisingState = allowedPurposes.length === 5;

            writeStateCookies(guState, iabStr, pAdvertisingState);
            postConsentState(guState, iabStr, pAdvertisingState, 'www');
        })
        .finally(() => {
            onStateChange.forEach((callback: onStateChangeFn): void => {
                callback(guState, iabState);
            });

            return Promise.resolve();
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

export {
    getVendorList,
    getGuPurposeList,
    getConsentState,
    setConsentState,
    registerStateChangeHandler,
};

export const _ = {
    IAB_VENDOR_LIST_PROD_URL,
    IAB_VENDOR_LIST_NOT_PROD_URL,
    reset: (): void => {
        guState = { functional: true, performance: true };
        iabState = { 1: null, 2: null, 3: null, 4: null, 5: null };
        onStateChange.length = 0;
        initialised = false;
    },
};
