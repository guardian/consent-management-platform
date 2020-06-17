import { readIabCookie, readLegacyCookie } from './cookies';

export const shouldShow = (shouldRepermission = false): boolean => {
	if (shouldRepermission) {
		return !readIabCookie(); // TODO: Restore readGuCookie check once we start saving GU cookie
	}

	return !readIabCookie() && !readLegacyCookie();
};
