import * as _Cookies from 'js-cookie';
import { ConsentString } from 'consent-string';
import { onGuConsentNotification, onIabConsentNotification, _ } from './cmp';
import { GU_PURPOSE_LIST } from './config';
import { readIabCookie as _readIabCookie } from './cookies';

const Cookies = _Cookies;
const readIabCookie = _readIabCookie;

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
        beforeEach(() => {
            ConsentString.mockImplementation(() => {
                return {
                    isPurposeAllowed: jest.fn(() => true),
                };
            });
        });

        describe('if no IAB cookie available', () => {
            beforeEach(() => {
                readIabCookie.mockReturnValue(null);
            });

            it('executes advertisement callback with true if GU_TK cookie is true', () => {
                Cookies.get.mockReturnValue('1.54321');

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith({
                    1: true,
                    2: true,
                    3: true,
                    4: true,
                    5: true,
                });
            });

            it('executes advertisement callback with true if GU_TK cookie is false', () => {
                Cookies.get.mockReturnValue('0.54321');

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith({
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false,
                });
            });

            it('executes advertisement callback with null if GU_TK cookie is null', () => {
                Cookies.get.mockReturnValue(undefined);

                const myCallBack = jest.fn();

                onIabConsentNotification(myCallBack);

                expect(myCallBack).toBeCalledWith({
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null,
                });
            });

            it('executes advertisement callback each time consent nofication triggered with updated state', () => {
                Cookies.get
                    .mockReturnValue('1.54321') // default
                    .mockReturnValueOnce(undefined); // first call

                const myCallBack = jest.fn();
                const expectedArguments = [
                    [
                        {
                            1: null,
                            2: null,
                            3: null,
                            4: null,
                            5: null,
                        },
                    ],
                ];

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
                    _.setStateFromCookies();
                    expectedArguments.push([
                        {
                            1: true,
                            2: true,
                            3: true,
                            4: true,
                            5: true,
                        },
                    ]);
                }

                expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
                expect(myCallBack.mock.calls).toEqual(expectedArguments);
            });
        });
    });

    // describe('if cmpIsReady is TRUE when onGuConsentNotification called', () => {
    //     purposes.forEach(purpose => {
    //         const { eventId, alwaysEnabled } = purpose;

    //         if (!alwaysEnabled) {
    //             it(`executes ${eventId} callback immediately`, () => {
    //                 const myCallBack = jest.fn();

    //                 onGuConsentNotification(eventId, myCallBack);

    //                 expect(myCallBack).toHaveBeenCalledTimes(1);
    //             });
    //         }
    //     });

    //     it('executes functional callback with initial functional state', () => {
    //         const myCallBack = jest.fn();

    //         onGuConsentNotification('functional', myCallBack);

    //         expect(myCallBack).toBeCalledWith(true);
    //     });

    //     it('executes performance callback with initial performance state', () => {
    //         const myCallBack = jest.fn();

    //         onGuConsentNotification('performance', myCallBack);

    //         expect(myCallBack).toBeCalledWith(true);
    //     });

    //     it('executes advertisement callback with initial advertisement state true if getAdConsentState true', () => {
    //         Cookies.get.mockReturnValue('1.54321');

    //         const myCallBack = jest.fn();

    //         onIabConsentNotification(myCallBack);

    //         expect(myCallBack).toBeCalledWith({
    //             1: true,
    //             2: true,
    //             3: true,
    //             4: true,
    //             5: true,
    //         });
    //     });

    //     it('executes advertisement callback with initial advertisement state false if getAdConsentState false', () => {
    //         Cookies.get.mockReturnValue('0.54321');

    //         const myCallBack = jest.fn();

    //         onIabConsentNotification(myCallBack);

    //         expect(myCallBack).toBeCalledWith({
    //             1: false,
    //             2: false,
    //             3: false,
    //             4: false,
    //             5: false,
    //         });
    //     });

    //     it('executes advertisement callback with initial advertisement state null if getAdConsentState null', () => {
    //         Cookies.get.mockReturnValue(undefined);

    //         const myCallBack = jest.fn();

    //         onIabConsentNotification(myCallBack);

    //         expect(myCallBack).toBeCalledWith({
    //             1: null,
    //             2: null,
    //             3: null,
    //             4: null,
    //             5: null,
    //         });
    //     });

    //     it('executes advertisement callback each time consent nofication triggered', () => {
    //         Cookies.get.mockReturnValue('1.54321');

    //         const myCallBack = jest.fn();
    //         const expectedArguments = [
    //             [
    //                 {
    //                     1: true,
    //                     2: true,
    //                     3: true,
    //                     4: true,
    //                     5: true,
    //                 },
    //             ],
    //         ];

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
    //             _.triggerConsentNotification();
    //             expectedArguments.push([
    //                 {
    //                     1: true,
    //                     2: true,
    //                     3: true,
    //                     4: true,
    //                     5: true,
    //                 },
    //             ]);
    //         }

    //         expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
    //         expect(myCallBack.mock.calls).toEqual(expectedArguments);
    //     });
    // });
});
