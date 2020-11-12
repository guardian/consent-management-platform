/* istanbul ignore file */

export const mark = (label: string): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typescript is too futuristic for some browsers
	window.performance?.mark?.(label);

	if (process.env.NODE_ENV !== 'test') {
		console.log(`%c[event] %c${label}`, 'color: deepskyblue; ', '');
	}
};
