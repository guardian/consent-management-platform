import {
    CMP_URL,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
    IAB_VENDOR_LIST_URL,
    IAB_CMP_ID,
    IAB_CMP_VERSION,
    IAB_CONSENT_SCREEN,
    IAB_CONSENT_LANGUAGE,
} from './config';
import * as cookie from './cookies';
import { setupMessageHandlers, canShow } from './cmp-ui';

export * from './cmp';
export const cmpCookie = cookie;
export const cmpConfig = {
    CMP_URL,
    CMP_READY_MSG,
    CMP_SAVED_MSG,
    CMP_CLOSE_MSG,
    GU_PURPOSE_LIST,
    IAB_VENDOR_LIST_URL,
    IAB_CMP_ID,
    IAB_CMP_VERSION,
    IAB_CONSENT_SCREEN,
    IAB_CONSENT_LANGUAGE,
};
export const cmpUi = {
    setupMessageHandlers,
    canShow,
};
