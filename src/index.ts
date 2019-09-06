import {
    CMP_DOMAIN,
    COOKIE_MAX_AGE,
    GU_AD_CONSENT_COOKIE,
    GU_COOKIE_NAME,
    IAB_VENDOR_LIST_URL,
    IAB_COOKIE_NAME,
    IAB_CMP_ID,
    IAB_CMP_VERSION,
    IAB_CONSENT_SCREEN,
    IAB_CONSENT_LANGUAGE,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
} from './config';
import * as cookie from './cookies';
import * as types from './types';

export * from './cmp';
export const cmpCookie = cookie;
export const CmpType = types;

export const cmpConfig = {
    CMP_DOMAIN,
    COOKIE_MAX_AGE,
    GU_AD_CONSENT_COOKIE,
    GU_COOKIE_NAME,
    IAB_VENDOR_LIST_URL,
    IAB_COOKIE_NAME,
    IAB_CMP_ID,
    IAB_CMP_VERSION,
    IAB_CONSENT_SCREEN,
    IAB_CONSENT_LANGUAGE,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
};
