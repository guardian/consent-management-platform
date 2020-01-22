import { ConsentString } from 'consent-string';
import {
    registerStateChangeHandler,
    getVendorList,
    getGuPurposeList,
    getConsentState,
    setConsentState,
    _,
    setVariant,
    setSource,
    getVariant,
} from './store';
import { isProd, GU_PURPOSE_LIST } from './config';
import { readIabCookie, readLegacyCookie, writeStateCookies } from './cookies';
import { postConsentState } from './logs';
import { handleError } from './error';

jest.mock('consent-string', () => ({
    ConsentString: class {},
}));

jest.mock('./config', () => ({
    isProd: jest.fn(),
    GU_PURPOSE_LIST: {
        purposes: [
            { id: 0, name: 'Essential' },
            { id: 1, name: 'Functional' },
            { id: 2, name: 'Performance' },
        ],
    },
}));

jest.mock('./cookies', () => ({
    readGuCookie: jest.fn(),
    readIabCookie: jest.fn(),
    readLegacyCookie: jest.fn(),
    writeStateCookies: jest.fn(),
}));

jest.mock('./logs', () => ({
    postConsentState: jest.fn(),
}));

jest.mock('./error', () => ({
    handleError: jest.fn(),
}));

const fakeVendorList = {
    vendorListVersion: 173,
    lastUpdated: '2019-10-31T16:00:20Z',
    purposes: [
        {
            id: 1,
        },
        {
            id: 2,
        },
        {
            id: 3,
        },
        {
            id: 4,
        },
        {
            id: 5,
        },
    ],
    vendors: [
        {
            id: 1,
        },
        {
            id: 2,
        },
        {
            id: 3,
        },
    ],
};

const myCallBack = jest.fn();
const okResponse = {
    ok: true,
    json: () => fakeVendorList,
};
const notOkResponse = {
    ok: false,
    status: 500,
    statusText: 'failed',
};

const guDefaultState = { functional: true, performance: true };
const guMixedState = { functional: true, performance: false };
const iabDefaultState = { 1: null, 2: null, 3: null, 4: null, 5: null };
const iabTrueState = { 1: true, 2: true, 3: true, 4: true, 5: true };
const legacyTrueCookie = '1.54321';
const fakeIabString = 'UH IH OH HA HA';

describe('Store', () => {
    beforeEach(() => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => Promise.resolve(okResponse));
        readIabCookie.mockImplementation(() => null);
        readLegacyCookie.mockImplementation(() => null);
        isProd.mockReturnValue(false);
        ConsentString.prototype.isPurposeAllowed = () => true;
        ConsentString.prototype.setGlobalVendorList = jest.fn();
        ConsentString.prototype.setCmpId = jest.fn();
        ConsentString.prototype.setCmpVersion = jest.fn();
        ConsentString.prototype.setConsentScreen = jest.fn();
        ConsentString.prototype.setConsentLanguage = jest.fn();
        ConsentString.prototype.setPurposesAllowed = jest.fn();
        ConsentString.prototype.setVendorsAllowed = jest.fn();
        ConsentString.prototype.getConsentString = () => fakeIabString;
    });

    afterEach(() => {
        global.fetch.mockClear();
        delete global.fetch;
        jest.resetAllMocks();
        _.reset();
    });

    describe('getConsentState returns correct state', () => {
        it('when no consent cookies are available', () => {
            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabDefaultState,
            });
        });

        it('when the euconsents cookie is available', () => {
            readIabCookie.mockImplementation(() => 'foo');
            readLegacyCookie.mockImplementation(() => legacyTrueCookie);

            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabTrueState,
            });
        });

        it('falls back to legacy GU_TK cookie if available when euconsents cookie is unavailable', () => {
            readLegacyCookie.mockImplementation(() => legacyTrueCookie);

            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabTrueState,
            });
        });

        it('returns default iab state when euconsents cookie is unavailable and ignoreLegacyCookie is true', () => {
            readLegacyCookie.mockImplementation(() => legacyTrueCookie);

            expect(getConsentState(true)).toMatchObject({
                guState: guDefaultState,
                iabState: iabDefaultState,
            });
        });

        it('after a state change', () => {
            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabDefaultState,
            });

            setConsentState(guMixedState, iabTrueState);

            expect(getConsentState()).toMatchObject({
                guState: guMixedState,
                iabState: iabTrueState,
            });
        });
    });

    describe('reads cookies exactly once', () => {
        afterEach(() => {
            expect(readIabCookie).toHaveBeenCalledTimes(1);
            expect(readLegacyCookie).toHaveBeenCalledTimes(1);
        });

        it('when registerStateChangeHandler is called first', () => {
            registerStateChangeHandler(myCallBack);
            registerStateChangeHandler(myCallBack);
        });

        it('when getVendorList is called first', () => {
            getVendorList();
            getVendorList();
        });

        it('when getGuPurposeList is called first', () => {
            getGuPurposeList();
            getGuPurposeList();
        });

        it('when getConsentState is called first', () => {
            getConsentState();
            getConsentState();
        });

        it('when setConsentState is called first', () => {
            setConsentState(guMixedState, iabTrueState);
            setConsentState(guMixedState, iabTrueState);
        });
    });

    describe('setConsentState', () => {
        it('does not trigger StateChange handlers when the consent state is the same', () => {
            registerStateChangeHandler(myCallBack);

            return expect(setConsentState(guDefaultState, iabDefaultState))
                .resolves.toBeUndefined()
                .then(() => {
                    expect(myCallBack).not.toHaveBeenCalled();
                });
        });

        it('triggers StateChange handlers correctly when the new consent state is not the same', () => {
            registerStateChangeHandler(myCallBack);

            return expect(setConsentState(guMixedState, iabTrueState))
                .resolves.toBeUndefined()
                .then(() => {
                    return setConsentState(guDefaultState, iabDefaultState);
                })
                .then(() => {
                    expect(myCallBack).toHaveBeenCalledTimes(2);

                    expect(myCallBack).toHaveBeenNthCalledWith(
                        1,
                        guMixedState,
                        iabTrueState,
                    );
                    expect(myCallBack).toHaveBeenLastCalledWith(
                        guDefaultState,
                        iabDefaultState,
                    );
                });
        });

        it('calls setPurposesAllowed correctly', () => {
            const allowedPurposes = Object.keys(iabTrueState).map(purposeId => {
                return parseInt(purposeId, 10);
            });

            return expect(setConsentState(guMixedState, iabTrueState))
                .resolves.toBeUndefined()
                .then(() => {
                    expect(
                        ConsentString.prototype.setPurposesAllowed,
                    ).toHaveBeenCalledTimes(1);
                    expect(
                        ConsentString.prototype.setPurposesAllowed,
                    ).toHaveBeenCalledWith(allowedPurposes);
                });
        });

        it('calls setVendorsAllowed correctly', () => {
            const allowedVendors = fakeVendorList.vendors.map(
                vendor => vendor.id,
            );

            return expect(setConsentState(guMixedState, iabTrueState))
                .resolves.toBeUndefined()
                .then(() => {
                    expect(
                        ConsentString.prototype.setVendorsAllowed,
                    ).toHaveBeenCalledTimes(1);
                    expect(
                        ConsentString.prototype.setVendorsAllowed,
                    ).toHaveBeenCalledWith(allowedVendors);
                });
        });

        it('calls writeStateCookies correctly', () => {
            return expect(setConsentState(guMixedState, iabTrueState))
                .resolves.toBeUndefined()
                .then(() => {
                    expect(writeStateCookies).toHaveBeenCalledTimes(1);
                    expect(writeStateCookies).toHaveBeenLastCalledWith(
                        guMixedState,
                        fakeIabString,
                    );
                });
        });

        describe('calls postConsentState correctly', () => {
            it('with default variant', () => {
                return expect(setConsentState(guMixedState, iabTrueState))
                    .resolves.toBeUndefined()
                    .then(() => {
                        expect(postConsentState).toHaveBeenCalledTimes(1);
                        expect(postConsentState).toHaveBeenLastCalledWith(
                            guMixedState,
                            fakeIabString,
                            true,
                            _.DEFAULT_SOURCE,
                        );
                    });
            });

            it('after setting source', () => {
                const sourceStr = 'test source';
                setSource(sourceStr);

                return expect(setConsentState(guMixedState, iabTrueState))
                    .resolves.toBeUndefined()
                    .then(() => {
                        expect(postConsentState).toHaveBeenCalledTimes(1);
                        expect(postConsentState).toHaveBeenLastCalledWith(
                            guMixedState,
                            fakeIabString,
                            true,
                            sourceStr,
                        );
                    });
            });

            it('after setting variant', () => {
                const variantStr = 'test variant';
                setVariant(variantStr);
                return expect(setConsentState(guMixedState, iabTrueState))
                    .resolves.toBeUndefined()
                    .then(() => {
                        expect(postConsentState).toHaveBeenCalledTimes(1);
                        expect(postConsentState).toHaveBeenLastCalledWith(
                            guMixedState,
                            fakeIabString,
                            true,
                            _.DEFAULT_SOURCE,
                            variantStr,
                        );
                    });
            });
        });
    });

    describe('getVendorList', () => {
        it('fetches the vendor list from the correct URL when not in PROD', () => {
            return expect(getVendorList())
                .resolves.toMatchObject(fakeVendorList)
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledWith(
                        _.IAB_VENDOR_LIST_NOT_PROD_URL,
                    );
                });
        });

        it('fetches the vendor list from the correct URL when in PROD', () => {
            isProd.mockReturnValue(true);
            return expect(getVendorList())
                .resolves.toMatchObject(fakeVendorList)
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledWith(
                        _.IAB_VENDOR_LIST_PROD_URL,
                    );
                });
        });

        it('reports an error when the reply from fetch is an error code ', () => {
            global.fetch = jest
                .fn()
                .mockImplementation(() => Promise.resolve(notOkResponse));

            return expect(getVendorList())
                .resolves.toBeNull()
                .then(() => {
                    expect(handleError).toHaveBeenCalledTimes(1);
                    expect(handleError).toHaveBeenCalledWith(
                        `Error fetching vendor list: Error: ${notOkResponse.status} | ${notOkResponse.statusText}`,
                    );
                });
        });

        it('fetches vendor list exactly once', () => {
            return expect(getVendorList())
                .resolves.toMatchObject(fakeVendorList)
                .then(() => {
                    return getVendorList().then(() => {
                        expect(global.fetch).toHaveBeenCalledTimes(1);
                    });
                });
        });
    });

    describe('getVariant', () => {
        it('returns null when no variant has been set ', () => {
            expect(getVariant()).toBeNull();
        });

        it('returns the correct variant when one has been set ', () => {
            const variantString = 'test variant';
            setVariant(variantString);
            expect(getVariant()).toBe(variantString);
        });
    });

    it('getGuPurposeList returns the correct purpose list', () => {
        expect(getGuPurposeList()).toMatchObject(GU_PURPOSE_LIST);
    });
});
