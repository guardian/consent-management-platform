/* eslint-disable no-underscore-dangle */

import { mark } from '../mark';

// https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support-beta/gdpr-and-tcf-v2-setup-and-configuration#1-two-step-process-to-implement-the-gdpr-and-tcf-v2-code-snippet

declare global {
    interface Window {
        _sp_ccpa: {
            config: {
                mmsDomain: 'https://message.sp-prod.net';
                ccpaOrigin: 'https://ccpa-service.sp-prod.net';
                accountId: string;
                getDnsMsgMms: boolean;
                alwaysDisplayDns: boolean;
                siteHref: string | null;
                events?: {
                    onConsentReady?: () => void;
                    onMessageReady?: () => void;
                    onMessageReceiveData?: onMessaReceiveDataCallback;
                };
            };
            loadPrivacyManagerModal?: (unknown: unknown, id: string) => {}; // this function is undocumented
        };
        __uspapi: (
            command: string,
            version: number,
            callback: (uspdata: UspData | undefined, success: boolean) => void,
        ) => void;
    }
}

export interface MsgData {
    msg_id: number;
}

interface UspData {
    version: number;
    uspString: string;
}

type onReadyCallback = () => void;
type onMessaReceiveDataCallback = (data: MsgData) => void;

const accountId = '1257';

const ccpaStubSrc = `(function () { var e = false; var c = window; var t = document; function r() { if (!c.frames["__uspapiLocator"]) { if (t.body) { var a = t.body; var e = t.createElement("iframe"); e.style.cssText = "display:none"; e.name = "__uspapiLocator"; a.appendChild(e) } else { setTimeout(r, 5) } } } r(); function p() { var a = arguments; __uspapi.a = __uspapi.a || []; if (!a.length) { return __uspapi.a } else if (a[0] === "ping") { a[2]({ gdprAppliesGlobally: e, cmpLoaded: false }, true) } else { __uspapi.a.push([].slice.apply(a)) } } function l(t) { var r = typeof t.data === "string"; try { var a = r ? JSON.parse(t.data) : t.data; if (a.__cmpCall) { var n = a.__cmpCall; c.__uspapi(n.command, n.parameter, function (a, e) { var c = { __cmpReturn: { returnValue: a, success: e, callId: n.callId } }; t.source.postMessage(r ? JSON.stringify(c) : c, "*") }) } } catch (a) { } } if (typeof __uspapi !== "function") { c.__uspapi = p; __uspapi.msgHandler = l; c.addEventListener("message", l, false) } })();`;

const ccpaStub = document.createElement('script');
ccpaStub.id = 'sourcepoint-ccpa-stub';
ccpaStub.innerHTML = ccpaStubSrc;

const ccpaLib = document.createElement('script');
ccpaLib.id = 'sourcepoint-ccpa-lib';
ccpaLib.src = 'https://ccpa.sp-prod.net/ccpa.js';

export const init = (
    onCcpaReadyCallback: onReadyCallback,
    onMsgReceiveData: onMessaReceiveDataCallback,
) => {
    mark('cmp-ccpa-init');
    document.head.appendChild(ccpaStub);

    // make sure nothing else on the page has accidentally
    // used the _sp_* name as well
    if (window._sp_ccpa) {
        throw new Error(
            'Sourcepoint CCPA global (window._sp_ccpa) is already defined!',
        );
    }

    window._sp_ccpa = {
        config: {
            mmsDomain: 'https://message.sp-prod.net',
            ccpaOrigin: 'https://ccpa-service.sp-prod.net',
            accountId,
            getDnsMsgMms: true,
            alwaysDisplayDns: false,
            siteHref:
                window.location.host.indexOf('theguardian.com') !== -1
                    ? null
                    : 'https://test.theguardian.com',
            events: {
                onConsentReady() {
                    mark('cmp-ccpa-got-consent');
                    onCcpaReadyCallback();
                },
                onMessageReady: () => {
                    mark('cmp-ccpa-ui-displayed');
                },
                onMessageReceiveData: data => {
                    onMsgReceiveData(data);
                },
            },
        },
    };

    document.body.appendChild(ccpaLib);
};
