type onErrorFn = (error: string) => void;

let onError: onErrorFn;

const setErrorHandler = (newHandler: onErrorFn) => {
    onError = newHandler;
};

const handleError = (error: string) => {
    if (onError) {
        onError(error);
    }
};

export { setErrorHandler, handleError };
