import { setErrorHandler, handleError } from './error';

const myCallback = jest.fn();
const errorMsg = 'An error happened';

describe('Error', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('runs the default error handler correctly if no handler has been set', () => {
        /* eslint-disable no-console */
        console.error = jest.fn();

        handleError(errorMsg);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(errorMsg);
        /* eslint-enable no-console */
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
