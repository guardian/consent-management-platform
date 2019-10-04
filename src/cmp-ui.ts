import { readGuCookie, readIabCookie } from './cookies';
import { logConsent } from './consent-logs';
import {
    CMP_DOMAIN,
    CMP_READY_MSG,
    CMP_CLOSE_MSG,
    CMP_SAVED_MSG,
} from './config';

type Callback = (error?: Error) => void;

export const setupMessageHandlers = (
    onReadyCmp: Callback,
    onCloseCmp: Callback,
    onErrorCmp: Callback,
): void => {
    const receiveMessage = (event: MessageEvent): void => {
        const withError = (callback: Callback): void => {
            try {
                callback();
            } catch (e) {
                onErrorCmp(e);
            }
        };

        const { origin, data } = event;

        if (origin !== CMP_DOMAIN) {
            return;
        }

        const { msgType, msgData } = data;

        switch (msgType) {
            case CMP_READY_MSG:
                withError(onReadyCmp);
                break;
            case CMP_CLOSE_MSG:
                withError(onCloseCmp);
                break;
            case CMP_SAVED_MSG:
                logConsent(msgData)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(
                                `Error posting to consent logs: ${response.status} | ${response.statusText}`,
                            );
                        }
                    })
                    .catch(error => {
                        onErrorCmp(error);
                    });
                break;
            default:
                break;
        }
    };

    window.addEventListener('message', receiveMessage, false);
};

export const canShow = (): boolean => !readGuCookie() || !readIabCookie();
