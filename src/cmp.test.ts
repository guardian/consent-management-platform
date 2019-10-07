import * as _Cookies from 'js-cookie';
import { ConsentString } from 'consent-string';
import { onGuConsentNotification, onIabConsentNotification, _ } from './cmp';
import { GU_PURPOSE_LIST } from './config';
import { readIabCookie as _readIabCookie } from './cookies';

const Cookies = _Cookies;
const readIabCookie = _readIabCookie;
const iabTrueState = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
};
const iabFalseState = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
};
const iabNullState = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
};

jest.mock('js-cookie', () => ({
    get: jest.fn(),
}));

jest.mock('./cookies', () => ({
    readIabCookie: jest.fn(),
}));

jest.mock('consent-string');

describe('cmp', () => {
    beforeEach(() => {
        _.resetCmp();
        jest.resetAllMocks();
    });

    describe('onGuConsentNotification', () => {
        const { purposes } = GU_PURPOSE_LIST;

        purposes.forEach(purpose => {
            const { eventId, alwaysEnabled } = purpose;

            if (!alwaysEnabled) {
                it(`executes ${eventId} callback immediately`, () => {
                    const myCallBack = jest.fn();

                    onGuConsentNotification(eventId, myCallBack);

                    expect(myCallBack).toHaveBeenCalledTimes(1);
                });

                it(`executes ${eventId} callback with initial functional state`, () => {
                    const myCallBack = jest.fn();

                    onGuConsentNotification(eventId, myCallBack);

                    expect(myCallBack).toBeCalledWith(true);
                });
            }
        });
    });

    describe('onIabConsentNotification', () => {
        describe('if no IAB cookie available', () => {
            beforeEach(() => {
                readIabCookie.mockReturnValue(null);
            });

            it('executes advertisement callback with true state if GU_TK cookie is true', () => {
                Cookies.get.mockReturnValue('1.54321');

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith(iabTrueState);
            });

            it('executes advertisement callback with false state if GU_TK cookie is false', () => {
                Cookies.get.mockReturnValue('0.54321');

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith(iabFalseState);
            });

            it('executes advertisement callback with null state if GU_TK cookie is null', () => {
                Cookies.get.mockReturnValue(undefined);

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith(iabNullState);
            });

            //     it('executes advertisement callback each time consent nofication triggered with updated state', () => {
            //         Cookies.get
            //             .mockReturnValue('1.54321') // default
            //             .mockReturnValueOnce(undefined); // first call

            //         const myCallBack = jest.fn();
            //         const expectedArguments = [[iabNullState]];

            //         onIabConsentNotification(myCallBack);

            //         const triggerCount = 5;

            //         /**
            //          * TODO: Once the module under test handles
            //          * updates to state we should update this test
            //          * to handle 5 updates to state (with differing values)
            //          * rather than triggering consent notifications manually
            //          * so we can test the callback is receiving the correct
            //          * latest state.
            //          */
            //         for (let i = 0; i < triggerCount; i += 1) {
            //             _.setStateFromCookies();
            //             expectedArguments.push([iabTrueState]);
            //         }

            //         expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
            //         expect(myCallBack.mock.calls).toEqual(expectedArguments);
            //     });
            // });

            it('executes advertisement callback each time consent nofication triggered with updated state', () => {
                Cookies.get.mockReturnValue(undefined); // first call

                const myCallBack = jest.fn();
                const expectedArguments = [[iabNullState]];

                onIabConsentNotification(myCallBack);

                const triggerCount = 5;

                /**
                 * TODO: Once the module under test handles
                 * updates to state we should update this test
                 * to handle 5 updates to state (with differing values)
                 * rather than triggering consent notifications manually
                 * so we can test the callback is receiving the correct
                 * latest state.
                 */
                for (let i = 0; i < triggerCount; i += 1) {
                    _.updateStateOnSave(iabTrueState);
                    expectedArguments.push([iabTrueState]);
                }

                expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
                expect(myCallBack.mock.calls).toEqual(expectedArguments);
            });
        });

        describe('if IAB cookie available', () => {
            const fakeIabCookie = 'foo';

            beforeEach(() => {
                readIabCookie.mockReturnValue(fakeIabCookie);
            });

            it('executes advertisement callback with true state if IAB cookie is available', () => {
                ConsentString.mockImplementation(() => {
                    return {
                        isPurposeAllowed: jest.fn(() => true),
                    };
                });

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(ConsentString).toHaveBeenCalledTimes(1);
                expect(ConsentString).toHaveBeenCalledWith(fakeIabCookie);
                expect(myCallBack).toBeCalledWith(iabTrueState);
            });

            it('executes advertisement callback with false state if IAB cookie is available', () => {
                ConsentString.mockImplementation(() => {
                    return {
                        isPurposeAllowed: jest.fn(() => false),
                    };
                });

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(ConsentString).toHaveBeenCalledTimes(1);
                expect(ConsentString).toHaveBeenCalledWith(fakeIabCookie);
                expect(myCallBack).toBeCalledWith(iabFalseState);
            });

            it('executes advertisement callback each time consent nofication triggered with updated state', () => {
                ConsentString.mockImplementation(() => {
                    return {
                        isPurposeAllowed: jest.fn(() => false),
                    };
                });

                const myCallBack = jest.fn();
                const expectedArguments = [[iabFalseState]];

                onIabConsentNotification(myCallBack);

                const triggerCount = 5;

                /**
                 * TODO: Once the module under test handles
                 * updates to state we should update this test
                 * to handle 5 updates to state (with differing values)
                 * rather than triggering consent notifications manually
                 * so we can test the callback is receiving the correct
                 * latest state.
                 */
                for (let i = 0; i < triggerCount; i += 1) {
                    _.updateStateOnSave(iabTrueState);
                    expectedArguments.push([iabTrueState]);
                }

                expect(ConsentString).toHaveBeenCalledTimes(1);
                expect(ConsentString).toHaveBeenCalledWith(fakeIabCookie);
                expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
                expect(myCallBack.mock.calls).toEqual(expectedArguments);
            });
        });
    });
});
