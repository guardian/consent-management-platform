const COOKIE_NAME = 'gu-cmp-disabled';

export const disable = () => {
	document.cookie = `${COOKIE_NAME}=true`;
};

export const enable = () => {
	document.cookie = `${COOKIE_NAME}=false`;
};

export const isDisabled = () =>
	new RegExp(`${COOKIE_NAME}=true(\\W+|$)`).test(document.cookie);
