type onErrorFn = (error: string) => void;

// eslint-disable-next-line no-console
let onError: onErrorFn = error => console.error(error);

const setErrorHandler = (newHandler: onErrorFn): void => {
    onError = newHandler;
};

const handleError = (error: string): void => {
    if (onError) {
        onError(error);
    }
};

export { setErrorHandler, handleError };
