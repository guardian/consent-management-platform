import { isGuardianDomain } from './domain';

export const mark = (label: string) => {
	window.performance?.mark?.(label);
	if (!isGuardianDomain()) {
		// eslint-disable-next-line no-console
		console.log(label);
	}
};
