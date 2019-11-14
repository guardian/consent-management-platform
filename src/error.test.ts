import { setErrorHandler, handleError } from './error';

describe('Error', () => {
    it('run the error handler correctly after one has been set ', () => {
        const myCallback = jest.fn();
        const errorMsg = 'An error happened';

        setErrorHandler(myCallback);
        handleError(errorMsg);

        expect(myCallback).toHaveBeenCalledTimes(1);
        expect(myCallback).toHaveBeenCalledWith(errorMsg);
    });
});
