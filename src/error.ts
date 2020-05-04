type onErrorFn = (error: string) => void;

// eslint-disable-next-line no-console
let onError: onErrorFn = error => console.error(error);

const setErrorHandler = (newHandler: onErrorFn): noolean => {
    onError = newHandler;
};

const handleError = (error: string): boolean => {
    if (onError) {
        onError(error);
    }
};

export { setErrorHandler, handleError };
