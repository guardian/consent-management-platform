import * as _Cookies from 'js-cookie';
import { onConsentNotification, _ } from './cmp';

const Cookies = _Cookies;

jest.mock('js-cookie', () => ({
    get: jest.fn(),
}));

describe('cmp', () => {
    beforeEach(() => {
        _.resetCmp();
        jest.resetAllMocks();
    });

    describe('onConsentNotification', () => {
        const purposes = ['functional', 'performance', 'advertisement'];

        describe('if cmpIsReady is TRUE when onConsentNotification called', () => {
            purposes.forEach(purpose => {
                it(`executes ${purpose} callback immediately`, () => {
                    const myCallBack = jest.fn();

                    onConsentNotification(purpose, myCallBack);

                    expect(myCallBack).toHaveBeenCalledTimes(1);
                });
            });

            it('executes functional callback with initial functional state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('functional', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes performance callback with initial performance state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('performance', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state true if getAdConsentState true', () => {
                Cookies.get.mockReturnValue('1.54321');

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state false if getAdConsentState false', () => {
                Cookies.get.mockReturnValue('0.54321');

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(false);
            });

            it('executes advertisement callback with initial advertisement state null if getAdConsentState null', () => {
                Cookies.get.mockReturnValue(undefined);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(null);
            });

            it('executes advertisement callback each time consent nofication triggered', () => {
                Cookies.get.mockReturnValue('1.54321');

                const myCallBack = jest.fn();
                const expectedArguments = [[true]];

                onConsentNotification('advertisement', myCallBack);

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
                    _.triggerConsentNotification();
                    expectedArguments.push([true]);
                }

                expect(myCallBack).toHaveBeenCalledTimes(triggerCount + 1);
                expect(myCallBack.mock.calls).toEqual(expectedArguments);
            });
        });
    });
});
