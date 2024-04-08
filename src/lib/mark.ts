/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

/* istanbul ignore file */
import { log } from '@guardian/libs';

export const mark = (label: string): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typescript is too futuristic for some browsers
	window.performance?.mark?.(label);

	if (process.env.NODE_ENV !== 'test') {
		log('cmp', '[event]', label);
	}
};
