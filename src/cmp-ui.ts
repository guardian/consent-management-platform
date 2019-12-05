import { readIabCookie } from './cookies';

export const shouldShow = (): boolean => !readIabCookie(); // TODO: Restore readGuCookie check once we start saving GU cookie
