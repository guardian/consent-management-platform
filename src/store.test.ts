import {
    registerStateChangeHandler,
    getVendorList,
    getGuPurposeList,
    getConsentState,
    setConsentState,
    _,
} from './store';
import { readIabCookie, readLegacyCookie } from './cookies';
import { isProd, GU_PURPOSE_LIST } from './config';

jest.mock('./cookies', () => ({
    readGuCookie: jest.fn(),
    readIabCookie: jest.fn(),
    readLegacyCookie: jest.fn(),
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

const myCallBack = jest.fn();
const okResponse = {
    ok: true,
    json: () => 'foo',
};
const notOkResponse = {
    ok: false,
    status: 500,
    statusText: 'failed',
};

const guDefaultState = { functional: true, performance: true };
const iabDefaultState = { 1: null, 2: null, 3: null, 4: null, 5: null };
const guMixedState = { functional: true, performance: false };
const iabMixedState = { 1: true, 2: false, 3: false, 4: true, 5: true };
const iabMixedString =
    'BOpj_ITOpj_ITBwABAENCtmAAAAsJ7_______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-3zd4u_1vf99yfm1-7etr3tp_87ues2_Xur__79__3z3_9phP78k89r7337Ew-v-3o8bzBAI';
const legacyTrueCookie = '1.54321';
const iabTrueState = { 1: true, 2: true, 3: true, 4: true, 5: true };

describe('Store', () => {
    beforeEach(() => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => Promise.resolve(okResponse));
        readIabCookie.mockImplementation(() => null);
        readLegacyCookie.mockImplementation(() => null);
        isProd.mockReturnValue(false);
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
            readIabCookie.mockImplementation(() => iabMixedString);
            readLegacyCookie.mockImplementation(() => legacyTrueCookie);

            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabMixedState,
            });
        });
        it('falls back to legacy GU_TK cookie if available when euconsents cookie is unavailable', () => {
            readLegacyCookie.mockImplementation(() => legacyTrueCookie);

            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabTrueState,
            });
        });
        it('after a state change', () => {
            expect(getConsentState()).toMatchObject({
                guState: guDefaultState,
                iabState: iabDefaultState,
            });

            setConsentState(guMixedState, iabMixedState);

            expect(getConsentState()).toMatchObject({
                guState: guMixedState,
                iabState: iabMixedState,
            });
        });
    });

    describe('reads cookies and fetch vendor list exactly once', () => {
        afterEach(() => {
            expect(readIabCookie).toHaveBeenCalledTimes(1);
            expect(readLegacyCookie).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledTimes(1);
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
            setConsentState(iabMixedState, iabMixedState);
            setConsentState(iabMixedState, iabMixedState);
        });
    });

    describe('triggers StateChange handlers correctly', () => {
        it('when state changes', () => {
            registerStateChangeHandler(myCallBack);
            setConsentState(guDefaultState, iabDefaultState);
            setConsentState(guMixedState, iabMixedState);

            expect(myCallBack).toHaveBeenCalledTimes(2);
            expect(myCallBack).toHaveBeenNthCalledWith(
                1,
                guDefaultState,
                iabDefaultState,
            );
            expect(myCallBack).toHaveBeenLastCalledWith(
                guMixedState,
                iabMixedState,
            );
        });
    });

    describe('getVendorList', () => {
        it('fetches the vendor list from the correct URL when not in PROD', () => {
            return getVendorList().then(result => {
                expect(result).toEqual('foo');
                expect(global.fetch).toHaveBeenCalledWith(
                    _.IAB_VENDOR_LIST_NOT_PROD_URL,
                );
            });
        });
        it('fetches the vendor list from the correct URL when in PROD', () => {
            isProd.mockReturnValue(true);
            return getVendorList().then(result => {
                expect(result).toEqual('foo');
                expect(global.fetch).toHaveBeenCalledWith(
                    _.IAB_VENDOR_LIST_PROD_URL,
                );
            });
        });
        it('reports an error when the reply from fetch is an error code ', () => {
            global.fetch = jest
                .fn()
                .mockImplementation(() => Promise.resolve(notOkResponse));

            return getVendorList().catch(error => {
                expect(error).toEqual(
                    `${notOkResponse.status} | ${notOkResponse.statusText}`,
                );
            });
        });
    });

    it('getGuPurposeList returns the correct purpose list', () => {
        expect(getGuPurposeList()).toMatchObject(GU_PURPOSE_LIST);
    });
});
