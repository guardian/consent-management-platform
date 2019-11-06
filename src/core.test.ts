import {
    init,
    onGuConsentNotification,
    onIabConsentNotification,
    _,
} from './core';
import { GU_PURPOSE_LIST } from './config';
import { getConsentState, registerStateChangeHandler } from './store';

const guNullState = {
    functional: null,
    performance: null,
};
const guTrueState = {
    functional: true,
    performance: true,
};
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

jest.mock('./store', () => ({
    registerStateChangeHandler: jest.fn(),
    getConsentState: jest.fn(),
}));

describe('core', () => {
    beforeEach(() => {
        _.reset();
        jest.resetAllMocks();
    });

    describe('init', () => {
        it(`registers onStateChange callback with store`, () => {
            init();

            expect(registerStateChangeHandler).toHaveBeenCalledTimes(1);
        });

        it(`only registers onStateChange callback with store once if init called more than once`, () => {
            init();
            init();

            expect(registerStateChangeHandler).toHaveBeenCalledTimes(1);
        });
    });

    describe('onGuConsentNotification', () => {
        const { purposes } = GU_PURPOSE_LIST;
        const enabledPurposes = purposes.filter(
            purpose => !purpose.alwaysEnabled,
        );
        const fakeGuState = enabledPurposes.reduce((state, purpose) => {
            return {
                ...state,
                [purpose.eventId]: true,
            };
        }, {});

        beforeEach(() => {
            getConsentState.mockReturnValue({
                guState: fakeGuState,
            });
        });

        enabledPurposes.forEach(purpose => {
            const { eventId } = purpose;

            it(`executes ${eventId} callback immediately`, () => {
                const myCallBack = jest.fn();

                onGuConsentNotification(eventId, myCallBack);

                expect(myCallBack).toHaveBeenCalledTimes(1);
            });

            it(`executes ${eventId} callback with initial ${eventId} state`, () => {
                const myCallBack = jest.fn();

                onGuConsentNotification(eventId, myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it(`registers onStateChange callback with store`, () => {
                const myCallBack = jest.fn();

                onGuConsentNotification(eventId, myCallBack);

                expect(registerStateChangeHandler).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('onIabConsentNotification', () => {
        it(`executes advertisment callback immediately`, () => {
            getConsentState.mockReturnValue({
                iabState: iabTrueState,
            });

            const myCallBack = jest.fn();

            onIabConsentNotification(myCallBack);

            expect(myCallBack).toHaveBeenCalledTimes(1);
        });

        it(`registers onStateChange callback with store`, () => {
            getConsentState.mockReturnValue({
                iabState: iabTrueState,
            });

            const myCallBack = jest.fn();

            onIabConsentNotification(myCallBack);

            expect(registerStateChangeHandler).toHaveBeenCalledTimes(1);
        });

        it('executes advertisement callback with true state', () => {
            getConsentState.mockReturnValue({
                iabState: iabTrueState,
            });

            const myCallBack = jest.fn();

            onIabConsentNotification(myCallBack);

            expect(myCallBack).toBeCalledWith(iabTrueState);
        });

        it('executes advertisement callback with false state', () => {
            getConsentState.mockReturnValue({
                iabState: iabFalseState,
            });

            const myCallBack = jest.fn();

            onIabConsentNotification(myCallBack);

            expect(myCallBack).toBeCalledWith(iabFalseState);
        });

        it('executes advertisement callback with null state', () => {
            getConsentState.mockReturnValue({
                iabState: iabNullState,
            });

            const myCallBack = jest.fn();

            onIabConsentNotification(myCallBack);

            expect(myCallBack).toBeCalledWith(iabNullState);
        });
    });
    it('Callbacks are executed each time consent nofication is triggered with updated state', () => {
        getConsentState.mockReturnValue({
            guState: guNullState,
            iabState: iabNullState,
        }); // first call

        const myIabCallback = jest.fn();
        const myGuFunctionalCallback = jest.fn();
        const myGuPerformanceCallback = jest.fn();
        const expectedGuArguments = [guNullState];
        const expectedIabArguments = [iabNullState];
        const triggerCount = 5;

        onGuConsentNotification('functional', myGuFunctionalCallback);
        onGuConsentNotification('performance', myGuPerformanceCallback);
        onIabConsentNotification(myIabCallback);

        for (let i = 0; i < triggerCount; i += 1) {
            _.onStateChange(guTrueState, iabTrueState);
            expectedGuArguments.push(guTrueState);
            expectedIabArguments.push(iabTrueState);
        }

        expect(myIabCallback).toHaveBeenCalledTimes(triggerCount + 1);

        for (let i = 0; i < triggerCount; i += 1) {
            expect(myGuFunctionalCallback).toHaveBeenNthCalledWith(
                i + 1,
                expectedGuArguments[i].functional,
            );
            expect(myGuPerformanceCallback).toHaveBeenNthCalledWith(
                i + 1,
                expectedGuArguments[i].performance,
            );
            expect(myIabCallback).toHaveBeenNthCalledWith(
                i + 1,
                expectedIabArguments[i],
            );
        }
    });
});
