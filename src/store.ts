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
import { handleError } from './error';

type onStateChangeFn = (
    guState: GuPurposeState,
    iabState: IabPurposeState,
) => void;

const DEFAULT_SOURCE = 'www';
const IAB_CMP_ID = 112;
const IAB_CMP_VERSION = 1;
const IAB_CONSENT_SCREEN = 0;
const IAB_CONSENT_LANGUAGE = 'en';
const IAB_VENDOR_LIST_PROD_URL =
    'https://api.nextgen.guardianapps.co.uk/commercial/cmp/vendorlist.json';
const IAB_VENDOR_LIST_NOT_PROD_URL =
    'https://code.dev-theguardian.com/commercial/cmp/vendorlist.json';

let initialised = false;
let source = DEFAULT_SOURCE;
let variant: string | null = null;
let vendorListPromise: Promise<IabVendorList>;
const onStateChange: onStateChangeFn[] = [];

// TODO: These defaults should be switched to null once the PECR purposes are activated
let guState: GuPurposeState = { functional: true, performance: true };
let iabState: IabPurposeState = { 1: null, 2: null, 3: null, 4: null, 5: null };

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
                handleError(`Error fetching vendor list: ${error}`);
                return Promise.reject();
            });

        guState = getGuStateFromCookie();
        iabState = getIabStateFromCookie();
        initialised = true;
    }
};

const registerStateChangeHandler = (callback: onStateChangeFn): void => {
    init();
    onStateChange.push(callback);
};

const getGuPurposeList = (): GuPurposeList => {
    init();
    return GU_PURPOSE_LIST;
};

const getVendorList = (): Promise<IabVendorList> => {
    init();
    return vendorListPromise;
};

const getConsentState = (
    ignoreLegacyCookie?: boolean,
): {
    guState: GuPurposeState;
    iabState: IabPurposeState;
} => {
    init();

    if (ignoreLegacyCookie) {
        return {
            guState,
            iabState: getIabStateFromCookie(ignoreLegacyCookie),
        };
    }

    return { guState, iabState };
};

const getVariant = (): string | null => {
    return variant;
};

const getGuStateFromCookie = (): GuPurposeState => {
    // TODO: Friendly reminder to update the getConsentState() unit tests after PECR is introduced
    return { functional: true, performance: true };
};

const getIabStateFromCookie = (
    ignoreLegacyCookie?: boolean,
): IabPurposeState => {
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

    if (!ignoreLegacyCookie) {
        const legacyCookie = readLegacyCookie();

        if (legacyCookie) {
            const legacyConsentState: boolean =
                legacyCookie.split('.')[0] === '1';

            Object.keys(iabState).forEach((key: string): void => {
                const purposeId = parseInt(key, 10);
                newIabState[purposeId] = legacyConsentState;
            });

            return newIabState;
        }
    }

    Object.keys(iabState).forEach((key: string): void => {
        const purposeId = parseInt(key, 10);
        newIabState[purposeId] = null;
    });

    return newIabState;
};

const setConsentState = (
    newGuState: GuPurposeState,
    newIabState: IabPurposeState,
): Promise<void> => {
    init();

    const triggerCallbacks = stateChanged(newGuState, newIabState);

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
            if (variant) {
                postConsentState(
                    guState,
                    iabStr,
                    pAdvertisingState,
                    source,
                    variant,
                );
            } else {
                postConsentState(guState, iabStr, pAdvertisingState, source);
            }
        })
        .finally(() => {
            if (triggerCallbacks) {
                onStateChange.forEach((callback: onStateChangeFn): void => {
                    callback(guState, iabState);
                });
            }

            return Promise.resolve();
        });
};

const setSource = (newSource: string): void => {
    source = newSource;
};

const setVariant = (newVariant: string): void => {
    variant = newVariant;
};

const stateChanged = (
    guNew: GuPurposeState,
    iabNew: IabPurposeState,
): boolean => {
    // There commented lines should be uncommented when the PECR purposes are reintroduced
    if (
        // Object.keys(guNew).length !== Object.keys(guState).length ||
        Object.keys(iabNew).length !== Object.keys(iabState).length
    ) {
        return true;
    }

    return (
        // Object.keys(guNew).reduce(
        //     (acc, key) => acc || guNew[key] !== guState[key],
        //     false as boolean,
        // ) ||
        Object.keys(iabNew).reduce(
            (acc, key) => {
                const keyAsNum = parseInt(key, 10);
                return acc || iabNew[keyAsNum] !== iabState[keyAsNum];
            },
            false as boolean,
        )
    );
};

export {
    registerStateChangeHandler,
    getGuPurposeList,
    getVendorList,
    getConsentState,
    getVariant,
    setConsentState,
    setSource,
    setVariant,
};

export const _ = {
    DEFAULT_SOURCE,
    IAB_VENDOR_LIST_PROD_URL,
    IAB_VENDOR_LIST_NOT_PROD_URL,
    reset: (): void => {
        guState = { functional: true, performance: true };
        iabState = { 1: null, 2: null, 3: null, 4: null, 5: null };
        onStateChange.length = 0;
        variant = null;
        source = DEFAULT_SOURCE;
        initialised = false;
    },
};
