'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _StorageFactory_storage, _local, _session, _a$2;
class StorageFactory {
    constructor(storage) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
        _StorageFactory_storage.set(this, void 0);
        try {
            const uid = new Date().toString();
            storage.setItem(uid, uid);
            const available = storage.getItem(uid) == uid;
            storage.removeItem(uid);
            if (available)
                __classPrivateFieldSet(this, _StorageFactory_storage, storage, "f");
        }
        catch (e) {
            // do nothing
        }
    }
    /**
     * Check whether storage is available.
     */
    isAvailable() {
        return Boolean(__classPrivateFieldGet(this, _StorageFactory_storage, "f"));
    }
    /* eslint-disable
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-return,
        @typescript-eslint/no-explicit-any
        --
        - we're using the `try` to handle anything bad happening
        - JSON.parse returns an `any`, we really are returning an `any`
    */
    /**
     * Retrieve an item from storage.
     *
     * @param key - the name of the item
     */
    get(key) {
        try {
            const { value, expires } = JSON.parse(__classPrivateFieldGet(this, _StorageFactory_storage, "f")?.getItem(key) ?? '');
            // is this item has passed its sell-by-date, remove it
            if (expires && new Date() > new Date(expires)) {
                this.remove(key);
                return null;
            }
            return value;
        }
        catch (e) {
            return null;
        }
    }
    /* eslint-enable
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-return,
        @typescript-eslint/no-explicit-any
    */
    /**
     * Save a value to storage.
     *
     * @param key - the name of the item
     * @param value - the data to save
     * @param expires - optional date on which this data will expire
     */
    set(key, value, expires) {
        return __classPrivateFieldGet(this, _StorageFactory_storage, "f")?.setItem(key, JSON.stringify({
            value,
            expires,
        }));
    }
    /**
     * Remove an item from storage.
     *
     * @param key - the name of the item
     */
    remove(key) {
        return __classPrivateFieldGet(this, _StorageFactory_storage, "f")?.removeItem(key);
    }
    /**
     * Removes all items from storage.
     */
    clear() {
        return __classPrivateFieldGet(this, _StorageFactory_storage, "f")?.clear();
    }
    /**
     * Retrieve an item from storage in its raw state.
     *
     * @param key - the name of the item
     */
    getRaw(key) {
        return __classPrivateFieldGet(this, _StorageFactory_storage, "f")?.getItem(key) ?? null;
    }
    /**
     * Save a raw value to storage.
     *
     * @param key - the name of the item
     * @param value - the data to save
     */
    setRaw(key, value) {
        return __classPrivateFieldGet(this, _StorageFactory_storage, "f")?.setItem(key, value);
    }
}
_StorageFactory_storage = new WeakMap();
/**
 * Manages using `localStorage` and `sessionStorage`.
 *
 * Has a few advantages over the native API, including
 * - failing gracefully if storage is not available
 * - you can save and retrieve any JSONable data
 *
 * All methods are available for both `localStorage` and `sessionStorage`.
 */
const storage = new (_a$2 = class {
        constructor() {
            _local.set(this, void 0);
            _session.set(this, void 0);
        }
        // creating the instance requires testing the native implementation
        // which is blocking. therefore, only create new instances of the factory
        // when it's accessed i.e. we know we're going to use it
        get local() {
            return (__classPrivateFieldSet(this, _local, __classPrivateFieldGet(this, _local, "f") || new StorageFactory(localStorage), "f"));
        }
        get session() {
            return (__classPrivateFieldSet(this, _session, __classPrivateFieldGet(this, _session, "f") || new StorageFactory(sessionStorage), "f"));
        }
    },
    _local = new WeakMap(),
    _session = new WeakMap(),
    _a$2)();

/**
 * You can only subscribe to teams from this list.
 * Add your team name below to start logging.
 *
 * Make sure your label has a contrast ratio of 4.5 or more.
 * */
const teams = {
    common: {
        background: '#052962',
        font: '#ffffff',
    },
    commercial: {
        background: '#77EEAA',
        font: '#004400',
    },
    cmp: {
        background: '#FF6BB5',
        font: '#2F0404',
    },
    dotcom: {
        background: '#000000',
        font: '#ff7300',
    },
    design: {
        background: '#185E36',
        font: '#FFF4F2',
    },
    tx: {
        background: '#2F4F4F',
        font: '#FFFFFF',
    },
};

/**
 *
 * Handles team-based logging to the browser console
 *
 * Prevents a proliferation of console.log in client-side
 * code.
 *
 * Subscribing to logs relies on LocalStorage
 */
var _a$1;
const KEY = 'gu.logger';
const teamColours = teams;
const style = (team) => {
    const { background, font } = teamColours[team];
    return `background: ${background}; color: ${font}; padding: 2px 3px; border-radius:3px`;
};
/**
 * Runs in all environments, if local storage values are set.
 */
const log = (team, ...args) => {
    // TODO add check for localStorage
    if (!(storage.local.get(KEY) || '').includes(team))
        return;
    const styles = [style('common'), '', style(team), ''];
    console.log(`%c@guardian%c %c${team}%c`, ...styles, ...args);
};
/**
 * Subscribe to a team’s log
 * @param team the team’s unique ID
 */
const subscribeTo = (team) => {
    const teamSubscriptions = storage.local.get(KEY)
        ? storage.local.get(KEY).split(',')
        : [];
    if (!teamSubscriptions.includes(team))
        teamSubscriptions.push(team);
    storage.local.set(KEY, teamSubscriptions.join(','));
    log(team, '🔔 Subscribed, hello!');
};
/**
 * Unsubscribe to a team’s log
 * @param team the team’s unique ID
 */
const unsubscribeFrom = (team) => {
    log(team, '🔕 Unsubscribed, good-bye!');
    const teamSubscriptions = storage.local.get(KEY)
        .split(',')
        .filter((t) => t !== team);
    storage.local.set(KEY, teamSubscriptions.join(','));
};
/* istanbul ignore next */
if (typeof window !== 'undefined') {
    window.guardian || (window.guardian = {});
    (_a$1 = window.guardian).logger || (_a$1.logger = {
        subscribeTo,
        unsubscribeFrom,
        teams: () => Object.keys(teamColours),
    });
}

const mark = (label) => {
    window.performance?.mark?.(label);
    {
        log('cmp', '[event]', label);
    }
};

const isServerSide = typeof window === 'undefined';
const serverSideWarn = () => {
    console.warn('This is a server-side version of the @guardian/consent-management-platform', 'No consent signals will be received.');
};
const serverSideWarnAndReturn = (arg) => {
    return () => {
        serverSideWarn();
        return arg;
    };
};
const cmp$1 = {
    __disable: serverSideWarn,
    __enable: serverSideWarnAndReturn(false),
    __isDisabled: serverSideWarnAndReturn(false),
    hasInitialised: serverSideWarnAndReturn(false),
    init: serverSideWarn,
    showPrivacyManager: serverSideWarn,
    version: 'n/a',
    willShowPrivacyMessage: serverSideWarnAndReturn(Promise.resolve(false)),
    willShowPrivacyMessageSync: serverSideWarnAndReturn(false),
};
const onConsent$2 = () => {
    serverSideWarn();
    return Promise.resolve({
        canTarget: false,
        framework: null,
    });
};
const onConsentChange$2 = () => {
    return serverSideWarn();
};
const getConsentFor$2 = (vendor, consent) => {
    console.log(`Server-side call for getConsentFor(${vendor}, ${JSON.stringify(consent)})`, 'getConsentFor will always return false server-side');
    serverSideWarn();
    return false;
};

let isGuardian;
const isGuardianDomain = () => {
    if (typeof isGuardian === 'undefined') {
        if (isServerSide) {
            isGuardian = true;
        }
        else {
            isGuardian = window.location.host.endsWith('.theguardian.com');
        }
    }
    return isGuardian;
};

const ACCOUNT_ID = 1257;
const PRIVACY_MANAGER_CCPA = '5eba7ef78c167c47ca8b433d';
const PRIVACY_MANAGER_TCFV2 = 106842;
const PRIVACY_MANAGER_AUSTRALIA = '5f859e174ed5055e72ce26a6';
const ENDPOINT = isGuardianDomain()
    ? 'https://sourcepoint.theguardian.com'
    : 'https://cdn.privacy-mgmt.com';

const getProperty = ({ live, test, }) => (isGuardianDomain() ? live : test);

const api$2 = (command) => new Promise((resolve, reject) => {
    if (window.__uspapi) {
        window.__uspapi(command, 1, (result, success) => success
            ? resolve(result)
            :
                reject(new Error(`Unable to get ${command} data`)));
    }
    else {
        reject(new Error('No __uspapi found on window'));
    }
});
const getUSPData$1 = () => api$2('getUSPData');

const getConsentState$3 = async () => {
    const uspData = await getUSPData$1();
    const optedOut = uspData.uspString.charAt(2) === 'Y';
    return {
        personalisedAdvertising: !optedOut,
    };
};

const api$1 = (command) => new Promise((resolve, reject) => {
    if (window.__uspapi) {
        window.__uspapi(command, 1, (result, success) => success
            ? resolve(result)
            :
                reject(new Error(`Unable to get ${command} data`)));
    }
    else {
        reject(new Error('No __uspapi found on window'));
    }
});
const getUSPData = () => api$1('getUSPData');

const getConsentState$2 = async () => {
    const uspData = await getUSPData();
    return {
        doNotSell: uspData.uspString.charAt(2) === 'Y',
    };
};

let currentFramework;
const setCurrentFramework = (framework) => {
    log('cmp', `Framework set to ${framework}`);
    currentFramework = framework;
};
const getCurrentFramework = () => currentFramework;

const getGpcSignal = () => {
    return isServerSide ? undefined : navigator.globalPrivacyControl;
};

const api = (command) => new Promise((resolve, reject) => {
    if (window.__tcfapi) {
        window.__tcfapi(command, 2, (result, success) => success
            ? resolve(result)
            :
                reject(new Error(`Unable to get ${command} data`)));
    }
    else {
        reject(new Error('No __tcfapi found on window'));
    }
});
const getTCData = () => api('getTCData');
const getCustomVendorConsents = () => api('getCustomVendorConsents');

const defaultConsents = {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
    '7': false,
    '8': false,
    '9': false,
    '10': false,
};
const getConsentState$1 = async () => {
    const [tcData, customVendors] = await Promise.all([
        getTCData(),
        getCustomVendorConsents(),
    ]);
    if (typeof tcData === 'undefined') {
        const currentFramework = getCurrentFramework() ?? 'undefined';
        throw new Error(`No TC Data found with current framework: ${currentFramework}`);
    }
    const consents = {
        ...defaultConsents,
        ...tcData.purpose.consents,
    };
    const { eventStatus, gdprApplies, tcString, addtlConsent } = tcData;
    const { grants } = customVendors;
    const vendorConsents = Object.keys(grants)
        .sort()
        .reduce((acc, cur) => ({ ...acc, [cur]: grants[cur].vendorGrant }), {});
    return {
        consents,
        eventStatus,
        vendorConsents,
        addtlConsent,
        gdprApplies,
        tcString,
    };
};

const callBackQueue = [];
const awaitingUserInteractionInTCFv2 = (state) => state.tcfv2?.eventStatus === 'cmpuishown';
const invokeCallback = (callback, state) => {
    if (awaitingUserInteractionInTCFv2(state))
        return;
    const stateString = JSON.stringify(state);
    if (stateString !== callback.lastState) {
        callback.fn(state);
        callback.lastState = stateString;
    }
};
const enhanceConsentState = (consentState) => {
    const gpcSignal = getGpcSignal();
    if (consentState.tcfv2) {
        const consents = consentState.tcfv2.consents;
        return {
            ...consentState,
            canTarget: Object.keys(consents).length > 0 &&
                Object.values(consents).every(Boolean),
            framework: 'tcfv2',
            gpcSignal,
        };
    }
    else if (consentState.ccpa) {
        return {
            ...consentState,
            canTarget: !consentState.ccpa.doNotSell,
            framework: 'ccpa',
            gpcSignal,
        };
    }
    else if (consentState.aus) {
        return {
            ...consentState,
            canTarget: consentState.aus.personalisedAdvertising,
            framework: 'aus',
            gpcSignal,
        };
    }
    return {
        ...consentState,
        canTarget: false,
        framework: null,
        gpcSignal,
    };
};
const getConsentState = async () => {
    if (window.__uspapi) {
        if (getCurrentFramework() === 'aus')
            return enhanceConsentState({ aus: await getConsentState$3() });
        return enhanceConsentState({ ccpa: await getConsentState$2() });
    }
    if (window.__tcfapi) {
        return enhanceConsentState({ tcfv2: await getConsentState$1() });
    }
    throw new Error('no IAB consent framework found on the page');
};
const invokeCallbacks = () => {
    void getConsentState().then((state) => {
        if (awaitingUserInteractionInTCFv2(state))
            return;
        callBackQueue.forEach((callback) => invokeCallback(callback, state));
    });
};
const onConsentChange$1 = (callBack) => {
    const newCallback = { fn: callBack };
    callBackQueue.push(newCallback);
    void getConsentState()
        .then((consentState) => {
        invokeCallback(newCallback, consentState);
    })
        .catch(() => {
    });
};

/* eslint-disable -- this is third party code */
/* istanbul ignore file */

// https://documentation.sourcepoint.com/web-implementation/sourcepoint-setup-and-ccpa-configuration

const stub$2 = () => {
	var e = false;
	var c = window;
	var t = document;
	function r() {
		if (!c.frames['__uspapiLocator']) {
			if (t.body) {
				var a = t.body;
				var e = t.createElement('iframe');
				e.style.cssText = 'display:none';
				e.name = '__uspapiLocator';
				a.appendChild(e);
			} else {
				setTimeout(r, 5);
			}
		}
	}
	r();
	function p() {
		var a = arguments;
		__uspapi.a = __uspapi.a || [];
		if (!a.length) {
			return __uspapi.a;
		} else if (a[0] === 'ping') {
			a[2]({ gdprAppliesGlobally: e, cmpLoaded: false }, true);
		} else {
			__uspapi.a.push([].slice.apply(a));
		}
	}
	function l(t) {
		var r = typeof t.data === 'string';
		try {
			var a = r ? JSON.parse(t.data) : t.data;
			if (a.__cmpCall) {
				var n = a.__cmpCall;
				c.__uspapi(n.command, n.parameter, function (a, e) {
					var c = {
						__cmpReturn: {
							returnValue: a,
							success: e,
							callId: n.callId,
						},
					};
					t.source.postMessage(r ? JSON.stringify(c) : c, '*');
				});
			}
		} catch (a) {}
	}
	if (typeof __uspapi !== 'function') {
		c.__uspapi = p;
		__uspapi.msgHandler = l;
		c.addEventListener('message', l, false);
	}
};

let resolveWillShowPrivacyMessage$2;
const willShowPrivacyMessage$6 = new Promise((resolve) => {
    resolveWillShowPrivacyMessage$2 = resolve;
});
let resolveSourcepointLibraryLoaded;
new Promise((resolve) => {
    resolveSourcepointLibraryLoaded = resolve;
});
const properties$2 = {
    live: 'https://au.theguardian.com',
    test: 'https://au.theguardian.com',
};
const init$6 = (pubData = {}) => {
    stub$2();
    if (window._sp_ccpa) {
        throw new Error('Sourcepoint CCPA global (window._sp_ccpa) is already defined!');
    }
    invokeCallbacks();
    window._sp_ccpa = {
        config: {
            baseEndpoint: ENDPOINT,
            accountId: ACCOUNT_ID,
            getDnsMsgMms: true,
            alwaysDisplayDns: false,
            siteHref: getProperty(properties$2),
            targetingParams: {
                framework: 'aus',
            },
            pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },
            events: {
                onConsentReady: () => {
                    mark('cmp-aus-got-consent');
                    setTimeout(invokeCallbacks, 0);
                },
                onMessageReady: () => {
                    mark('cmp-aus-ui-displayed');
                },
                onMessageReceiveData: (data) => {
                    void resolveWillShowPrivacyMessage$2(data.msg_id !== 0);
                    void resolveSourcepointLibraryLoaded();
                },
                onMessageChoiceSelect: (_, choiceTypeID) => {
                    if (choiceTypeID === 11 ||
                        choiceTypeID === 13 ||
                        choiceTypeID === 15) {
                        setTimeout(invokeCallbacks, 0);
                    }
                },
            },
        },
    };
    const ausLib = document.createElement('script');
    ausLib.id = 'sourcepoint-aus-lib';
    ausLib.src = `${ENDPOINT}/ccpa.js`;
    document.body.appendChild(ausLib);
};

const init$5 = (pubData) => {
    mark('cmp-aus-init');
    init$6(pubData);
};
const willShowPrivacyMessage$5 = () => willShowPrivacyMessage$6;
function showPrivacyManager$3() {
    window._sp_ccpa?.loadPrivacyManagerModal?.(null, PRIVACY_MANAGER_AUSTRALIA);
}
const AUS = {
    init: init$5,
    willShowPrivacyMessage: willShowPrivacyMessage$5,
    showPrivacyManager: showPrivacyManager$3,
};

/* eslint-disable -- this is third party code */
/* istanbul ignore file */

// https://documentation.sourcepoint.com/web-implementation/sourcepoint-setup-and-ccpa-configuration

const stub$1 = () => {
	var e = false;
	var c = window;
	var t = document;
	function r() {
		if (!c.frames['__uspapiLocator']) {
			if (t.body) {
				var a = t.body;
				var e = t.createElement('iframe');
				e.style.cssText = 'display:none';
				e.name = '__uspapiLocator';
				a.appendChild(e);
			} else {
				setTimeout(r, 5);
			}
		}
	}
	r();
	function p() {
		var a = arguments;
		__uspapi.a = __uspapi.a || [];
		if (!a.length) {
			return __uspapi.a;
		} else if (a[0] === 'ping') {
			a[2]({ gdprAppliesGlobally: e, cmpLoaded: false }, true);
		} else {
			__uspapi.a.push([].slice.apply(a));
		}
	}
	function l(t) {
		var r = typeof t.data === 'string';
		try {
			var a = r ? JSON.parse(t.data) : t.data;
			if (a.__cmpCall) {
				var n = a.__cmpCall;
				c.__uspapi(n.command, n.parameter, function (a, e) {
					var c = {
						__cmpReturn: {
							returnValue: a,
							success: e,
							callId: n.callId,
						},
					};
					t.source.postMessage(r ? JSON.stringify(c) : c, '*');
				});
			}
		} catch (a) {}
	}
	if (typeof __uspapi !== 'function') {
		c.__uspapi = p;
		__uspapi.msgHandler = l;
		c.addEventListener('message', l, false);
	}
};

let resolveWillShowPrivacyMessage$1;
const willShowPrivacyMessage$4 = new Promise((resolve) => {
    resolveWillShowPrivacyMessage$1 = resolve;
});
const properties$1 = {
    live: null,
    test: 'https://test.theguardian.com',
};
const init$4 = (pubData = {}) => {
    stub$1();
    if (window._sp_ccpa) {
        throw new Error('Sourcepoint CCPA global (window._sp_ccpa) is already defined!');
    }
    invokeCallbacks();
    window._sp_ccpa = {
        config: {
            baseEndpoint: ENDPOINT,
            accountId: ACCOUNT_ID,
            getDnsMsgMms: true,
            alwaysDisplayDns: false,
            siteHref: getProperty(properties$1),
            targetingParams: {
                framework: 'ccpa',
            },
            pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },
            events: {
                onConsentReady: () => {
                    mark('cmp-ccpa-got-consent');
                    setTimeout(invokeCallbacks, 0);
                },
                onMessageReady: () => {
                    mark('cmp-ccpa-ui-displayed');
                },
                onMessageReceiveData: (data) => {
                    void resolveWillShowPrivacyMessage$1(data.msg_id !== 0);
                },
                onMessageChoiceSelect: (_, choiceTypeID) => {
                    if (choiceTypeID === 11 ||
                        choiceTypeID === 13 ||
                        choiceTypeID === 15) {
                        setTimeout(invokeCallbacks, 0);
                    }
                },
            },
        },
    };
    const ccpaLib = document.createElement('script');
    ccpaLib.id = 'sourcepoint-ccpa-lib';
    ccpaLib.src = `${ENDPOINT}/ccpa.js`;
    document.body.appendChild(ccpaLib);
};

const init$3 = (pubData) => {
    mark('cmp-ccpa-init');
    init$4(pubData);
};
const willShowPrivacyMessage$3 = () => willShowPrivacyMessage$4;
function showPrivacyManager$2() {
    window._sp_ccpa?.loadPrivacyManagerModal?.(null, PRIVACY_MANAGER_CCPA);
}
const CCPA = {
    init: init$3,
    willShowPrivacyMessage: willShowPrivacyMessage$3,
    showPrivacyManager: showPrivacyManager$2,
};

const COOKIE_NAME = 'gu-cmp-disabled';
const disable = () => {
    document.cookie = `${COOKIE_NAME}=true`;
};
const enable = () => {
    document.cookie = `${COOKIE_NAME}=false`;
};
const isDisabled = () => new RegExp(`${COOKIE_NAME}=true(\\W+|$)`).test(document.cookie);

const VendorIDs = {
    a9: ['5f369a02b8e05c308701f829'],
    acast: ['5f203dcb1f0dea790562e20f'],
    braze: ['5ed8c49c4b8ce4571c7ad801'],
    comscore: ['5efefe25b8e05c06542b2a77'],
    fb: ['5e7e1298b8e05c54a85c52d2'],
    'google-analytics': ['5e542b3a4cd8884eb41b5a72'],
    'google-mobile-ads': ['5f1aada6b8e05c306c0597d7'],
    'google-tag-manager': ['5e952f6107d9d20c88e7c975'],
    googletag: ['5f1aada6b8e05c306c0597d7'],
    ias: ['5e7ced57b8e05c485246ccf3'],
    inizio: ['5e37fc3e56a5e6615502f9c9'],
    ipsos: ['5f745ab96f3aae0163740409'],
    linkedin: ['5f2d22a6b8e05c02aa283b3c'],
    lotame: ['5ed6aeb1b8e05c241a63c71f'],
    nielsen: ['5ef5c3a5b8e05c69980eaa5b'],
    ophan: ['5f203dbeeaaaa8768fd3226a'],
    permutive: ['5eff0d77969bfa03746427eb'],
    prebid: ['5f92a62aa22863685f4daa4c'],
    redplanet: ['5f199c302425a33f3f090f51'],
    remarketing: ['5ed0eb688a76503f1016578f'],
    sentry: ['5f0f39014effda6e8bbd2006'],
    teads: ['5eab3d5ab8e05c2bbe33f399'],
    twitter: ['5e71760b69966540e4554f01'],
    'youtube-player': ['5e7ac3fae30e7d1bc1ebf5e8'],
};

const getConsentFor$1 = (vendor, consent) => {
    const sourcepointIds = VendorIDs[vendor];
    if (typeof sourcepointIds === 'undefined' || sourcepointIds === []) {
        throw new Error(`Vendor '${vendor}' not found, or with no Sourcepoint ID. ` +
            'If it should be added, raise an issue at https://github.com/guardian/consent-management-platform/issues');
    }
    if (consent.ccpa) {
        return !consent.ccpa.doNotSell;
    }
    if (consent.aus) {
        return consent.aus.personalisedAdvertising;
    }
    const foundSourcepointId = sourcepointIds.find((id) => typeof consent.tcfv2?.vendorConsents[id] !== 'undefined');
    if (typeof foundSourcepointId === 'undefined') {
        console.warn(`No consent returned from Sourcepoint for vendor: '${vendor}'`);
        return false;
    }
    const tcfv2Consent = consent.tcfv2?.vendorConsents[foundSourcepointId];
    if (typeof tcfv2Consent === 'undefined') {
        console.warn(`No consent returned from Sourcepoint for vendor: '${vendor}'`);
        return false;
    }
    return tcfv2Consent;
};

const getFramework = (countryCode) => {
    let framework;
    switch (countryCode) {
        case 'US':
            framework = 'ccpa';
            break;
        case 'AU':
            framework = 'aus';
            break;
        case 'GB':
        default:
            framework = 'tcfv2';
            break;
    }
    return framework;
};

const onConsent$1 = () => new Promise((resolve, reject) => {
    onConsentChange$1((consentState) => {
        if (consentState.tcfv2 || consentState.ccpa || consentState.aus) {
            resolve(consentState);
        }
        reject('Unknown framework');
    });
});

/* eslint-disable -- this is third party code */
/* istanbul ignore file */

// https://documentation.sourcepoint.com/web-implementation/web-implementation/sourcepoint-gdpr-and-tcf-v2-support/gdpr-and-tcf-v2-setup-and-configuration_v1.1.3

const stub = () => {
	// prettier-ignore
	var e=function(){for(var e,t="__tcfapiLocator",a=[],n=window;n;){try{if(n.frames[t]){e=n;break}}catch(e){}if(n===window.top)break;n=n.parent;}e||(function e(){var a=n.document,r=!!n.frames[t];if(!r)if(a.body){var i=a.createElement("iframe");i.style.cssText="display:none",i.name=t,a.body.appendChild(i);}else setTimeout(e,5);return !r}(),n.__tcfapi=function(){for(var e,t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];if(!n.length)return a;if("setGdprApplies"===n[0])n.length>3&&2===parseInt(n[1],10)&&"boolean"==typeof n[3]&&(e=n[3],"function"==typeof n[2]&&n[2]("set",!0));else if("ping"===n[0]){var i={gdprApplies:e,cmpLoaded:!1,cmpStatus:"stub"};"function"==typeof n[2]&&n[2](i);}else a.push(n);},n.addEventListener("message",function(e){var t="string"==typeof e.data,a={};try{a=t?JSON.parse(e.data):e.data;}catch(e){}var n=a.__tcfapiCall;n&&window.__tcfapi(n.command,n.version,function(a,r){var i={__tcfapiReturn:{returnValue:a,success:r,callId:n.callId}};t&&(i=JSON.stringify(i)),e.source.postMessage(i,"*");},n.parameter);},!1));};
	// call `e` directly. See https://github.com/guardian/consent-management-platform/pull/185
	// 'undefined' != typeof module ? (module.exports = e) : e();
	e();
};

let resolveWillShowPrivacyMessage;
const willShowPrivacyMessage$2 = new Promise((resolve) => {
    resolveWillShowPrivacyMessage = resolve;
});
const properties = {
    live: null,
    test: 'https://test.theguardian.com',
};
const init$2 = (pubData = {}) => {
    stub();
    if (window._sp_) {
        throw new Error('Sourcepoint TCF global (window._sp_) is already defined!');
    }
    invokeCallbacks();
    window._sp_ = {
        config: {
            baseEndpoint: ENDPOINT,
            accountId: ACCOUNT_ID,
            propertyHref: getProperty(properties),
            targetingParams: {
                framework: 'tcfv2',
            },
            pubData: { ...pubData, cmpInitTimeUtc: new Date().getTime() },
            events: {
                onConsentReady: () => {
                    mark('cmp-tcfv2-got-consent');
                    setTimeout(invokeCallbacks, 0);
                },
                onMessageReady: () => {
                    mark('cmp-tcfv2-ui-displayed');
                },
                onMessageReceiveData: (data) => {
                    void resolveWillShowPrivacyMessage(data.messageId !== 0);
                },
                onMessageChoiceSelect: (_, choiceTypeID) => {
                    if (choiceTypeID === 11 ||
                        choiceTypeID === 13 ||
                        choiceTypeID === 15) {
                        setTimeout(invokeCallbacks, 0);
                    }
                },
            },
        },
    };
    const tcfLib = document.createElement('script');
    tcfLib.id = 'sourcepoint-tcfv2-lib';
    tcfLib.src = `${ENDPOINT}/wrapperMessagingWithoutDetection.js`;
    document.body.appendChild(tcfLib);
};

const init$1 = (pubData) => {
    mark('cmp-tcfv2-init');
    init$2(pubData);
};
const willShowPrivacyMessage$1 = () => willShowPrivacyMessage$2;
function showPrivacyManager$1() {
    window._sp_?.loadPrivacyManagerModal?.(PRIVACY_MANAGER_TCFV2);
}
const TCFv2 = {
    init: init$1,
    willShowPrivacyMessage: willShowPrivacyMessage$1,
    showPrivacyManager: showPrivacyManager$1,
};

var _a, _b, _c, _d;
if (!isServerSide) {
    window.guCmpHotFix || (window.guCmpHotFix = {});
}
let frameworkCMP;
let _willShowPrivacyMessage;
let initComplete = false;
let resolveInitialised;
const initialised = new Promise((resolve) => {
    resolveInitialised = resolve;
});
const init = ({ pubData, country }) => {
    if (isDisabled() || isServerSide)
        return;
    if (window.guCmpHotFix.initialised) {
        if (window.guCmpHotFix.cmp?.version !== "0.0.0-this-never-updates-in-source-code-refer-to-git-tags")
            console.warn('Two different versions of the CMP are running:', [
                "0.0.0-this-never-updates-in-source-code-refer-to-git-tags",
                window.guCmpHotFix.cmp?.version,
            ]);
        return;
    }
    window.guCmpHotFix.initialised = true;
    if (typeof country === 'undefined') {
        throw new Error('CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.');
    }
    const framework = getFramework(country);
    switch (framework) {
        case 'ccpa':
            frameworkCMP = CCPA;
            break;
        case 'aus':
            frameworkCMP = AUS;
            break;
        case 'tcfv2':
        default:
            frameworkCMP = TCFv2;
            break;
    }
    setCurrentFramework(framework);
    frameworkCMP.init(pubData ?? {});
    void frameworkCMP.willShowPrivacyMessage().then((willShowValue) => {
        _willShowPrivacyMessage = willShowValue;
        initComplete = true;
        log('cmp', 'initComplete');
    });
    resolveInitialised();
};
const willShowPrivacyMessage = () => initialised.then(() => frameworkCMP?.willShowPrivacyMessage() ?? false);
const willShowPrivacyMessageSync = () => {
    if (_willShowPrivacyMessage !== undefined) {
        return _willShowPrivacyMessage;
    }
    throw new Error('CMP has not been initialised. Use the async willShowPrivacyMessage() instead.');
};
const hasInitialised = () => initComplete;
const showPrivacyManager = () => {
    if (!frameworkCMP) {
        console.warn('cmp.showPrivacyManager() was called before the CMP was initialised. This will work but you are probably calling cmp.init() too late.');
    }
    void initialised.then(frameworkCMP?.showPrivacyManager);
};
const cmp = isServerSide
    ? cmp$1
    : ((_a = window.guCmpHotFix).cmp || (_a.cmp = {
        init,
        willShowPrivacyMessage,
        willShowPrivacyMessageSync,
        hasInitialised,
        showPrivacyManager,
        version: "0.0.0-this-never-updates-in-source-code-refer-to-git-tags",
        __isDisabled: isDisabled,
        __enable: enable,
        __disable: disable,
    }));
const onConsent = isServerSide
    ? onConsent$2
    : ((_b = window.guCmpHotFix).onConsent || (_b.onConsent = onConsent$1));
const onConsentChange = isServerSide
    ? onConsentChange$2
    : ((_c = window.guCmpHotFix).onConsentChange || (_c.onConsentChange = onConsentChange$1));
const getConsentFor = isServerSide
    ? getConsentFor$2
    : ((_d = window.guCmpHotFix).getConsentFor || (_d.getConsentFor = getConsentFor$1));

exports.cmp = cmp;
exports.getConsentFor = getConsentFor;
exports.onConsent = onConsent;
exports.onConsentChange = onConsentChange;
