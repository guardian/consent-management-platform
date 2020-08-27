export const mark = (label: string): void => {
	window.performance?.mark?.(label);
	if (process.env.NODE_ENV !== 'test') {
		// eslint-disable-next-line no-console
		console.log(`%c[event] %c${label}`, 'color: deepskyblue; ', '');
	}
};
