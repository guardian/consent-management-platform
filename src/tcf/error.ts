type onErrorFn = (error: string) => void;

// eslint-disable-next-line no-console
let onError: onErrorFn = (error) => console.error(error);

const setErrorHandler = (newHandler: onErrorFn) => {
	onError = newHandler;
};

const handleError = (error: string) => {
	if (onError) {
		onError(error);
	}
};

export { setErrorHandler, handleError };
