import {
    CMP_URL,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
} from './config';
import * as cookie from './cookies';

export * from './cmp';
export const cmpCookie = cookie;
export const cmpConfig = {
    CMP_URL,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
};
