/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { disable, enable, isDisabled } from './disable.ts';

describe('Disabling consent management', () => {
	it('should be enabled by default', () => {
		expect(isDisabled()).toBe(false);
	});
	it('should disable consent management', () => {
		disable();
		enable();
		disable();
		expect(isDisabled()).toBe(true);
	});
	it('should enable consent management', () => {
		enable();
		disable();
		enable();
		expect(isDisabled()).toBe(false);
	});
});
