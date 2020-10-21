import { Framework } from './types';

let currentFramework: Framework | undefined;

export const setCurrentFramework = (framework: Framework): void => {
	currentFramework = framework;
};
export const getCurrentFramework = (): Framework | undefined =>
	currentFramework;
