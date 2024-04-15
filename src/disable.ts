/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

const COOKIE_NAME = 'gu-cmp-disabled';

export const disable = (): void => {
	document.cookie = `${COOKIE_NAME}=true`;
};

export const enable = (): void => {
	document.cookie = `${COOKIE_NAME}=false`;
};

export const isDisabled = (): boolean =>
	new RegExp(`${COOKIE_NAME}=true(\\W+|$)`).test(document.cookie);
