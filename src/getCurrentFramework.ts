/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { log } from '@guardian/libs';
import type { Framework } from './types';

let currentFramework: Framework | undefined;

export const unsetFramework = (): void => {
	log('cmp', 'Framework set to undefined');
	currentFramework = undefined;
};
export const setCurrentFramework = (framework: Framework): void => {
	log('cmp', `Framework set to ${framework}`);
	currentFramework = framework;
};
export const getCurrentFramework = (): Framework | undefined =>
	currentFramework;
