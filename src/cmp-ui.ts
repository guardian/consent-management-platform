import { readIabCookie } from './cookies';

export const canShow = (): boolean => !readIabCookie(); // TODO: Restore readGuCookie check once we start saving GU cookie
