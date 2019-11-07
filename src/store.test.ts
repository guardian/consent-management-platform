import {
    registerStateChangeHandler,
    getConsentState,
    setConsentState,
    _,
} from './store';
import { readIabCookie, readLegacyCookie } from './cookies';

jest.mock('./cookies', () => ({
    readGuCookie: jest.fn(),
    readIabCookie: jest.fn(),
    readLegacyCookie: jest.fn(),
}));

const myCallBack = jest.fn();
const okResponse = {
    ok: true,
    json: jest.fn(),
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

    describe('reads cookies exactly once', () => {
        it('when registerStateChangeHandler is called first', () => {
            registerStateChangeHandler(myCallBack);
            getConsentState();
            setConsentState(iabMixedState, iabMixedState);
            registerStateChangeHandler(myCallBack);

            expect(readIabCookie).toHaveBeenCalledTimes(1);
            expect(readLegacyCookie).toHaveBeenCalledTimes(1);
        });

        it('when getConsentState is called first', () => {
            getConsentState();
            setConsentState(iabMixedState, iabMixedState);
            registerStateChangeHandler(myCallBack);
            getConsentState();

            expect(readIabCookie).toHaveBeenCalledTimes(1);
            expect(readLegacyCookie).toHaveBeenCalledTimes(1);
        });

        it('when setConsentState is called first', () => {
            setConsentState(iabMixedState, iabMixedState);
            registerStateChangeHandler(myCallBack);
            getConsentState();
            setConsentState(iabMixedState, iabMixedState);

            expect(readIabCookie).toHaveBeenCalledTimes(1);
            expect(readLegacyCookie).toHaveBeenCalledTimes(1);
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
});
