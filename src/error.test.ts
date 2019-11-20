import { setErrorHandler, handleError } from './error';

const myCallback = jest.fn();
const errorMsg = 'An error happened';

describe('Error', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('runs the default error handler correctly if no handler has been set', () => {
        global.console = { error: jest.fn() };

        handleError(errorMsg);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(errorMsg);

        global.console.error.mockClear();
        delete global.console;
    });

    it('runs the error handler correctly after one has been set', () => {
        setErrorHandler(myCallback);
        handleError(errorMsg);

        expect(myCallback).toHaveBeenCalledTimes(1);
        expect(myCallback).toHaveBeenCalledWith(errorMsg);
    });

    it('runs the error handler everytime handleError is called', () => {
        setErrorHandler(myCallback);

        handleError(errorMsg);
        handleError(errorMsg);
        handleError(errorMsg);
        handleError(errorMsg);
        handleError(errorMsg);

        expect(myCallback).toHaveBeenCalledTimes(5);
    });
});
