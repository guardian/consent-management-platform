
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
function noop() {}

function run(fn) {
  return fn();
}

function blank_object() {
  return Object.create(null);
}

function run_all(fns) {
  fns.forEach(run);
}

function is_function(thing) {
  return typeof thing === 'function';
}

function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === 'object' || typeof a === 'function';
}

function is_empty(obj) {
  return Object.keys(obj).length === 0;
}

function null_to_empty(value) {
  return value == null ? '' : value;
}

function append(target, node) {
  target.appendChild(node);
}

function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}

function detach(node) {
  node.parentNode.removeChild(node);
}

function destroy_each(iterations, detaching) {
  for (var i = 0; i < iterations.length; i += 1) {
    if (iterations[i]) iterations[i].d(detaching);
  }
}

function element(name) {
  return document.createElement(name);
}

function text(data) {
  return document.createTextNode(data);
}

function space() {
  return text(' ');
}

function empty() {
  return text('');
}

function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}

function attr(node, attribute, value) {
  if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

function children(element) {
  return Array.from(element.childNodes);
}

function set_data(text, data) {
  data = '' + data;
  if (text.wholeText !== data) text.data = data;
}

var current_component;

function set_current_component(component) {
  current_component = component;
}

function get_current_component() {
  if (!current_component) throw new Error('Function called outside component initialization');
  return current_component;
}

function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}

var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;

function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}

function add_render_callback(fn) {
  render_callbacks.push(fn);
}

var flushing = false;
var seen_callbacks = new Set();

function flush() {
  if (flushing) return;
  flushing = true;

  do {
    // first, call beforeUpdate functions
    // and update components
    for (var i = 0; i < dirty_components.length; i += 1) {
      var component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }

    set_current_component(null);
    dirty_components.length = 0;

    while (binding_callbacks.length) {
      binding_callbacks.pop()();
    } // then, once components are updated, call
    // afterUpdate functions. This may cause
    // subsequent updates...


    for (var _i = 0; _i < render_callbacks.length; _i += 1) {
      var callback = render_callbacks[_i];

      if (!seen_callbacks.has(callback)) {
        // ...so guard against infinite loops
        seen_callbacks.add(callback);
        callback();
      }
    }

    render_callbacks.length = 0;
  } while (dirty_components.length);

  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }

  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}

function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    var dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}

var outroing = new Set();

function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}

function mount_component(component, target, anchor, customElement) {
  var {
    fragment,
    on_mount,
    on_destroy,
    after_update
  } = component.$$;
  fragment && fragment.m(target, anchor);

  if (!customElement) {
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
      var new_on_destroy = on_mount.map(run).filter(is_function);

      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        // Edge case - component was destroyed immediately,
        // most likely as a result of a binding initialising
        run_all(new_on_destroy);
      }

      component.$$.on_mount = [];
    });
  }

  after_update.forEach(add_render_callback);
}

function destroy_component(component, detaching) {
  var $$ = component.$$;

  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
    // preserve final state?)

    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}

function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }

  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}

function init$3(component, options, instance, create_fragment, not_equal, props) {
  var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
  var parent_component = current_component;
  set_current_component(component);
  var $$ = component.$$ = {
    fragment: null,
    ctx: null,
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(parent_component ? parent_component.$$.context : options.context || []),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false
  };
  var ready = false;
  $$.ctx = instance ? instance(component, options.props || {}, function (i, ret) {
    var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
      if (ready) make_dirty(component, i);
    }

    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update); // `false` as a special case of no DOM component

  $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

  if (options.target) {
    if (options.hydrate) {
      var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      $$.fragment && $$.fragment.c();
    }

    if (options.intro) transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }

  set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */


class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }

  $on(type, callback) {
    var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      var index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }

  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }

}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var __classPrivateFieldSet$1 = function (receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};

var __classPrivateFieldGet$1 = function (receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};

var _StorageFactory_storage$1, _local$1, _session$1, _a$2;

class StorageFactory$1 {
  constructor(storage) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    _StorageFactory_storage$1.set(this, void 0);

    try {
      var uid = new Date().toString();
      storage.setItem(uid, uid);
      var available = storage.getItem(uid) == uid;
      storage.removeItem(uid);
      if (available) __classPrivateFieldSet$1(this, _StorageFactory_storage$1, storage, "f");
    } catch (e) {// do nothing
    }
  }
  /**
   * Check whether storage is available.
   */


  isAvailable() {
    return Boolean(__classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f"));
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
      var _classPrivateFieldGe, _classPrivateFieldGe2;

      var {
        value,
        expires
      } = JSON.parse((_classPrivateFieldGe = (_classPrivateFieldGe2 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe2 === void 0 ? void 0 : _classPrivateFieldGe2.getItem(key)) !== null && _classPrivateFieldGe !== void 0 ? _classPrivateFieldGe : ''); // is this item has passed its sell-by-date, remove it

      if (expires && new Date() > new Date(expires)) {
        this.remove(key);
        return null;
      }

      return value;
    } catch (e) {
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
    var _classPrivateFieldGe3;

    return (_classPrivateFieldGe3 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe3 === void 0 ? void 0 : _classPrivateFieldGe3.setItem(key, JSON.stringify({
      value,
      expires
    }));
  }
  /**
   * Remove an item from storage.
   *
   * @param key - the name of the item
   */


  remove(key) {
    var _classPrivateFieldGe4;

    return (_classPrivateFieldGe4 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe4 === void 0 ? void 0 : _classPrivateFieldGe4.removeItem(key);
  }
  /**
   * Removes all items from storage.
   */


  clear() {
    var _classPrivateFieldGe5;

    return (_classPrivateFieldGe5 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe5 === void 0 ? void 0 : _classPrivateFieldGe5.clear();
  }
  /**
   * Retrieve an item from storage in its raw state.
   *
   * @param key - the name of the item
   */


  getRaw(key) {
    var _classPrivateFieldGe6, _classPrivateFieldGe7;

    return (_classPrivateFieldGe6 = (_classPrivateFieldGe7 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe7 === void 0 ? void 0 : _classPrivateFieldGe7.getItem(key)) !== null && _classPrivateFieldGe6 !== void 0 ? _classPrivateFieldGe6 : null;
  }
  /**
   * Save a raw value to storage.
   *
   * @param key - the name of the item
   * @param value - the data to save
   */


  setRaw(key, value) {
    var _classPrivateFieldGe8;

    return (_classPrivateFieldGe8 = __classPrivateFieldGet$1(this, _StorageFactory_storage$1, "f")) === null || _classPrivateFieldGe8 === void 0 ? void 0 : _classPrivateFieldGe8.setItem(key, value);
  }

}

_StorageFactory_storage$1 = new WeakMap();
/**
 * Manages using `localStorage` and `sessionStorage`.
 *
 * Has a few advantages over the native API, including
 * - failing gracefully if storage is not available
 * - you can save and retrieve any JSONable data
 *
 * All methods are available for both `localStorage` and `sessionStorage`.
 */

var storage$1 = new (_a$2 = class {
  constructor() {
    _local$1.set(this, void 0);

    _session$1.set(this, void 0);
  } // creating the instance requires testing the native implementation
  // which is blocking. therefore, only create new instances of the factory
  // when it's accessed i.e. we know we're going to use it


  get local() {
    return __classPrivateFieldSet$1(this, _local$1, __classPrivateFieldGet$1(this, _local$1, "f") || new StorageFactory$1(localStorage), "f");
  }

  get session() {
    return __classPrivateFieldSet$1(this, _session$1, __classPrivateFieldGet$1(this, _session$1, "f") || new StorageFactory$1(sessionStorage), "f");
  }

}, _local$1 = new WeakMap(), _session$1 = new WeakMap(), _a$2)();
/**
 * You can only subscribe to teams from this list.
 * Add your team name below to start logging.
 *
 * Make sure your label has a contrast ratio of 4.5 or more.
 * */

var teams$1 = {
  common: {
    background: '#052962',
    font: '#ffffff'
  },
  commercial: {
    background: '#77EEAA',
    font: '#004400'
  },
  cmp: {
    background: '#FF6BB5',
    font: '#2F0404'
  },
  dotcom: {
    background: '#000000',
    font: '#ff7300'
  },
  design: {
    background: '#185E36',
    font: '#FFF4F2'
  },
  tx: {
    background: '#2F4F4F',
    font: '#FFFFFF'
  }
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

var _a$1$1;

var KEY$1 = 'gu.logger';
var teamColours$1 = teams$1;

var style$1 = team => {
  var {
    background,
    font
  } = teamColours$1[team];
  return "background: ".concat(background, "; color: ").concat(font, "; padding: 2px 3px; border-radius:3px");
};
/**
 * Runs in all environments, if local storage values are set.
 */


var log$1 = function log(team) {
  // TODO add check for localStorage
  if (!(storage$1.local.get(KEY$1) || '').includes(team)) return;
  var styles = [style$1('common'), '', style$1(team), ''];

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  console.log("%c@guardian%c %c".concat(team, "%c"), ...styles, ...args);
};
/**
 * Subscribe to a team’s log
 * @param team the team’s unique ID
 */


var subscribeTo$1 = team => {
  var teamSubscriptions = storage$1.local.get(KEY$1) ? storage$1.local.get(KEY$1).split(',') : [];
  if (!teamSubscriptions.includes(team)) teamSubscriptions.push(team);
  storage$1.local.set(KEY$1, teamSubscriptions.join(','));
  log$1(team, '🔔 Subscribed, hello!');
};
/**
 * Unsubscribe to a team’s log
 * @param team the team’s unique ID
 */


var unsubscribeFrom$1 = team => {
  log$1(team, '🔕 Unsubscribed, good-bye!');
  var teamSubscriptions = storage$1.local.get(KEY$1).split(',').filter(t => t !== team);
  storage$1.local.set(KEY$1, teamSubscriptions.join(','));
};
/* istanbul ignore next */


if (typeof window !== 'undefined') {
  window.guardian || (window.guardian = {});
  (_a$1$1 = window.guardian).logger || (_a$1$1.logger = {
    subscribeTo: subscribeTo$1,
    unsubscribeFrom: unsubscribeFrom$1,
    teams: () => Object.keys(teamColours$1)
  });
}

var currentFramework;

var setCurrentFramework = framework => {
  log$1('cmp', "Framework set to ".concat(framework));
  currentFramework = framework;
};

var getCurrentFramework = () => currentFramework;

var mark = label => {
  var _window$performance, _window$performance$m;

  (_window$performance = window.performance) === null || _window$performance === void 0 ? void 0 : (_window$performance$m = _window$performance.mark) === null || _window$performance$m === void 0 ? void 0 : _window$performance$m.call(_window$performance, label);
  {
    log$1('cmp', '[event]', label);
  }
};

var isServerSide = typeof window === 'undefined';

var serverSideWarn = () => {
  console.warn('This is a server-side version of the @guardian/consent-management-platform', 'No consent signals will be received.');
};

var serverSideWarnAndReturn = arg => {
  return () => {
    serverSideWarn();
    return arg;
  };
};

var cmp$1 = {
  __disable: serverSideWarn,
  __enable: serverSideWarnAndReturn(false),
  __isDisabled: serverSideWarnAndReturn(false),
  hasInitialised: serverSideWarnAndReturn(false),
  init: serverSideWarn,
  showPrivacyManager: serverSideWarn,
  version: 'n/a',
  willShowPrivacyMessage: serverSideWarnAndReturn(Promise.resolve(false)),
  willShowPrivacyMessageSync: serverSideWarnAndReturn(false)
};

var onConsent$2 = () => {
  serverSideWarn();
  return Promise.resolve({
    canTarget: false,
    framework: null
  });
};

var onConsentChange$2 = () => {
  return serverSideWarn();
};

var getConsentFor$2 = (vendor, consent) => {
  console.log("Server-side call for getConsentFor(".concat(vendor, ", ").concat(JSON.stringify(consent), ")"), 'getConsentFor will always return false server-side');
  serverSideWarn();
  return false;
};

var isGuardian;

var isGuardianDomain = () => {
  if (typeof isGuardian === 'undefined') {
    if (isServerSide) {
      isGuardian = true;
    } else {
      isGuardian = window.location.host.endsWith('.theguardian.com');
    }
  }

  return isGuardian;
};

var ACCOUNT_ID = 1257;
var PRIVACY_MANAGER_CCPA = 540252;
var PRIVACY_MANAGER_TCFV2 = 106842;
var PRIVACY_MANAGER_AUSTRALIA = 540341;
var ENDPOINT = isGuardianDomain() ? 'https://sourcepoint.theguardian.com' : 'https://cdn.privacy-mgmt.com';

var api$2 = command => new Promise((resolve, reject) => {
  if (window.__uspapi) {
    window.__uspapi(command, 1, (result, success) => success ? resolve(result) : reject(new Error("Unable to get ".concat(command, " data"))));
  } else {
    reject(new Error('No __uspapi found on window'));
  }
});

var getUSPData$1 = () => api$2('getUSPData');

var getConsentState$3 = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var uspData = yield getUSPData$1();
    var optedOut = uspData.uspString.charAt(2) === 'Y';
    return {
      personalisedAdvertising: !optedOut
    };
  });

  return function getConsentState$3() {
    return _ref.apply(this, arguments);
  };
}();

var api$1 = command => new Promise((resolve, reject) => {
  if (window.__uspapi) {
    window.__uspapi(command, 1, (result, success) => success ? resolve(result) : reject(new Error("Unable to get ".concat(command, " data"))));
  } else {
    reject(new Error('No __uspapi found on window'));
  }
});

var getUSPData = () => api$1('getUSPData');

var getConsentState$2 = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* () {
    var uspData = yield getUSPData();
    return {
      doNotSell: uspData.uspString.charAt(2) === 'Y'
    };
  });

  return function getConsentState$2() {
    return _ref2.apply(this, arguments);
  };
}();

var getGpcSignal = () => {
  return isServerSide ? undefined : navigator.globalPrivacyControl;
};

var api = command => new Promise((resolve, reject) => {
  if (window.__tcfapi) {
    window.__tcfapi(command, 2, (result, success) => success ? resolve(result) : reject(new Error("Unable to get ".concat(command, " data"))));
  } else {
    reject(new Error('No __tcfapi found on window'));
  }
});

var getTCData = () => api('getTCData');

var getCustomVendorConsents = () => api('getCustomVendorConsents');

var defaultConsents = {
  '1': false,
  '2': false,
  '3': false,
  '4': false,
  '5': false,
  '6': false,
  '7': false,
  '8': false,
  '9': false,
  '10': false
};

var getConsentState$1 = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* () {
    var [tcData, customVendors] = yield Promise.all([getTCData(), getCustomVendorConsents()]);

    if (typeof tcData === 'undefined') {
      var _getCurrentFramework;

      var _currentFramework = (_getCurrentFramework = getCurrentFramework()) !== null && _getCurrentFramework !== void 0 ? _getCurrentFramework : 'undefined';

      throw new Error("No TC Data found with current framework: ".concat(_currentFramework));
    }

    var consents = _objectSpread2(_objectSpread2({}, defaultConsents), tcData.purpose.consents);

    var {
      eventStatus,
      gdprApplies,
      tcString,
      addtlConsent
    } = tcData;
    var {
      grants
    } = customVendors;
    var vendorConsents = Object.keys(grants).sort().reduce((acc, cur) => _objectSpread2(_objectSpread2({}, acc), {}, {
      [cur]: grants[cur].vendorGrant
    }), {});
    return {
      consents,
      eventStatus,
      vendorConsents,
      addtlConsent,
      gdprApplies,
      tcString
    };
  });

  return function getConsentState$1() {
    return _ref3.apply(this, arguments);
  };
}();

var callBackQueue = [];

var awaitingUserInteractionInTCFv2 = state => {
  var _state$tcfv;

  return ((_state$tcfv = state.tcfv2) === null || _state$tcfv === void 0 ? void 0 : _state$tcfv.eventStatus) === 'cmpuishown';
};

var invokeCallback = (callback, state) => {
  if (awaitingUserInteractionInTCFv2(state)) return;
  var stateString = JSON.stringify(state);

  if (stateString !== callback.lastState) {
    callback.fn(state);
    callback.lastState = stateString;
  }
};

var enhanceConsentState = consentState => {
  var gpcSignal = getGpcSignal();

  if (consentState.tcfv2) {
    var consents = consentState.tcfv2.consents;
    return _objectSpread2(_objectSpread2({}, consentState), {}, {
      canTarget: Object.keys(consents).length > 0 && Object.values(consents).every(Boolean),
      framework: 'tcfv2',
      gpcSignal
    });
  } else if (consentState.ccpa) {
    return _objectSpread2(_objectSpread2({}, consentState), {}, {
      canTarget: !consentState.ccpa.doNotSell,
      framework: 'ccpa',
      gpcSignal
    });
  } else if (consentState.aus) {
    return _objectSpread2(_objectSpread2({}, consentState), {}, {
      canTarget: consentState.aus.personalisedAdvertising,
      framework: 'aus',
      gpcSignal
    });
  }

  return _objectSpread2(_objectSpread2({}, consentState), {}, {
    canTarget: false,
    framework: null,
    gpcSignal
  });
};

var getConsentState = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* () {
    switch (getCurrentFramework()) {
      case 'aus':
        return enhanceConsentState({
          aus: yield getConsentState$3()
        });

      case 'ccpa':
        return enhanceConsentState({
          ccpa: yield getConsentState$2()
        });

      case 'tcfv2':
        return enhanceConsentState({
          tcfv2: yield getConsentState$1()
        });

      default:
        throw new Error('no IAB consent framework found on the page');
    }
  });

  return function getConsentState() {
    return _ref4.apply(this, arguments);
  };
}();

var invokeCallbacks = () => {
  if (callBackQueue.length === 0) return;
  void getConsentState().then(state => {
    if (awaitingUserInteractionInTCFv2(state)) return;
    callBackQueue.forEach(callback => invokeCallback(callback, state));
  });
};

var onConsentChange$1 = callBack => {
  var newCallback = {
    fn: callBack
  };
  callBackQueue.push(newCallback);
  void getConsentState().then(consentState => {
    invokeCallback(newCallback, consentState);
  }).catch(() => {});
};
/* eslint-disable -- this is third party code */

/* istanbul ignore file */

/*
This code is the CCPA stub made available by Sourcepoint.

See the documentation on how to retrieve the latest version:
https://documentation.sourcepoint.com/implementation/web-implementation/multi-campaign-web-implementation#stub-file
*/


var stub_ccpa = () => {
  (function () {
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
        a[2]({
          gdprAppliesGlobally: e,
          cmpLoaded: false
        }, true);
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
                callId: n.callId
              }
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
  })();
};
/* eslint-disable -- this is third party code */

/* istanbul ignore file */

/*
This code is the TCFv2 stub made available by Sourcepoint.

See the documentation on how to retrieve the latest version:
https://documentation.sourcepoint.com/implementation/web-implementation/multi-campaign-web-implementation#stub-file
*/


var stub_tcfv2 = () => {
  !function (t) {
    var e = {};

    function n(r) {
      if (e[r]) return e[r].exports;
      var o = e[r] = {
        i: r,
        l: !1,
        exports: {}
      };
      return t[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports;
    }

    n.m = t, n.c = e, n.d = function (t, e, r) {
      n.o(t, e) || Object.defineProperty(t, e, {
        enumerable: !0,
        get: r
      });
    }, n.r = function (t) {
      'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
        value: 'Module'
      }), Object.defineProperty(t, '__esModule', {
        value: !0
      });
    }, n.t = function (t, e) {
      if (1 & e && (t = n(t)), 8 & e) return t;
      if (4 & e && 'object' == typeof t && t && t.__esModule) return t;
      var r = Object.create(null);
      if (n.r(r), Object.defineProperty(r, 'default', {
        enumerable: !0,
        value: t
      }), 2 & e && 'string' != typeof t) for (var o in t) {
        n.d(r, o, function (e) {
          return t[e];
        }.bind(null, o));
      }
      return r;
    }, n.n = function (t) {
      var e = t && t.__esModule ? function () {
        return t.default;
      } : function () {
        return t;
      };
      return n.d(e, 'a', e), e;
    }, n.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }, n.p = '', n(n.s = 3);
  }([function (t, e, n) {
    var r = n(2);
    t.exports = !r(function () {
      return 7 != Object.defineProperty({}, 'a', {
        get: function get() {
          return 7;
        }
      }).a;
    });
  }, function (t, e) {
    t.exports = function (t) {
      return 'object' == typeof t ? null !== t : 'function' == typeof t;
    };
  }, function (t, e) {
    t.exports = function (t) {
      try {
        return !!t();
      } catch (t) {
        return !0;
      }
    };
  }, function (t, e, n) {
    n(4), function () {
      if ('function' != typeof window.__tcfapi) {
        var t,
            e = [],
            n = window,
            r = n.document;
        !n.__tcfapi && function t() {
          var e = !!n.frames.__tcfapiLocator;
          if (!e) if (r.body) {
            var o = r.createElement('iframe');
            o.style.cssText = 'display:none', o.name = '__tcfapiLocator', r.body.appendChild(o);
          } else setTimeout(t, 5);
          return !e;
        }() && (n.__tcfapi = function () {
          for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++) {
            r[o] = arguments[o];
          }

          if (!r.length) return e;
          if ('setGdprApplies' === r[0]) r.length > 3 && 2 === parseInt(r[1], 10) && 'boolean' == typeof r[3] && (t = r[3], 'function' == typeof r[2] && r[2]('set', !0));else if ('ping' === r[0]) {
            var i = {
              gdprApplies: t,
              cmpLoaded: !1,
              apiVersion: '2.0'
            };
            'function' == typeof r[2] && r[2](i, !0);
          } else e.push(r);
        }, n.addEventListener('message', function (t) {
          var e = 'string' == typeof t.data,
              r = {};

          try {
            r = e ? JSON.parse(t.data) : t.data;
          } catch (t) {}

          var o = r.__tcfapiCall; // WARNING
          // This function call has been modified from the provided Sourcepoint code.
          // The parameter order has been updated as the original function call was incorrect as per the TCF specification.
          // See:
          // - Required interface: https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-does-the-cmp-provide-the-api
          // - Update to function: https://github.com/guardian/consent-management-platform/pull/561/commits/f6113f4a1f8fbe6cec5b4ea8e7b29b969fdb60f3#diff-b58313c0ab5f7b3c35c9d788a1e37e18c982fef7fb8a9b562d728163ffb8a8a1L152

          o && n.__tcfapi(o.command, o.version, function (n, r) {
            var i = {
              __tcfapiReturn: {
                returnValue: n,
                success: r,
                callId: o.callId
              }
            };
            e && (i = JSON.stringify(i)), t.source.postMessage(i, '*');
          }, o.parameter);
        }, !1));
      }
    }();
  }, function (t, e, n) {
    var r = n(0),
        o = n(5).f,
        i = Function.prototype,
        c = i.toString,
        u = /^s*function ([^ (]*)/;
    r && !('name' in i) && o(i, 'name', {
      configurable: !0,
      get: function get() {
        try {
          return c.call(this).match(u)[1];
        } catch (t) {
          return '';
        }
      }
    });
  }, function (t, e, n) {
    var r = n(0),
        o = n(6),
        i = n(10),
        c = n(11),
        u = Object.defineProperty;
    e.f = r ? u : function (t, e, n) {
      if (i(t), e = c(e, !0), i(n), o) try {
        return u(t, e, n);
      } catch (t) {}
      if ('get' in n || 'set' in n) throw TypeError('Accessors not supported');
      return 'value' in n && (t[e] = n.value), t;
    };
  }, function (t, e, n) {
    var r = n(0),
        o = n(2),
        i = n(7);
    t.exports = !r && !o(function () {
      return 7 != Object.defineProperty(i('div'), 'a', {
        get: function get() {
          return 7;
        }
      }).a;
    });
  }, function (t, e, n) {
    var r = n(8),
        o = n(1),
        i = r.document,
        c = o(i) && o(i.createElement);

    t.exports = function (t) {
      return c ? i.createElement(t) : {};
    };
  }, function (t, e, n) {
    (function (e) {
      var n = function n(t) {
        return t && t.Math == Math && t;
      };

      t.exports = n('object' == typeof globalThis && globalThis) || n('object' == typeof window && window) || n('object' == typeof self && self) || n('object' == typeof e && e) || Function('return this')();
    }).call(this, n(9));
  }, function (t, e) {
    var n;

    n = function () {
      return this;
    }();

    try {
      n = n || new Function('return this')();
    } catch (t) {
      'object' == typeof window && (n = window);
    }

    t.exports = n;
  }, function (t, e, n) {
    var r = n(1);

    t.exports = function (t) {
      if (!r(t)) throw TypeError(String(t) + ' is not an object');
      return t;
    };
  }, function (t, e, n) {
    var r = n(1);

    t.exports = function (t, e) {
      if (!r(t)) return t;
      var n, o;
      if (e && 'function' == typeof (n = t.toString) && !r(o = n.call(t))) return o;
      if ('function' == typeof (n = t.valueOf) && !r(o = n.call(t))) return o;
      if (!e && 'function' == typeof (n = t.toString) && !r(o = n.call(t))) return o;
      throw TypeError("Can't convert object to primitive value");
    };
  }]);
};

var stub = framework => {
  if (framework === 'tcfv2') stub_tcfv2();else stub_ccpa();
};

var resolveWillShowPrivacyMessage;
var willShowPrivacyMessage$2 = new Promise(resolve => {
  resolveWillShowPrivacyMessage = resolve;
});

var getProperty = framework => {
  if (framework == 'aus') return 'https://au.theguardian.com';
  return isGuardianDomain() ? null : 'https://test.theguardian.com';
};

var init$2 = function init$2(framework) {
  var pubData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  stub(framework);

  if (window._sp_) {
    throw new Error('Sourcepoint global (window._sp_) is already defined!');
  }

  setCurrentFramework(framework);
  invokeCallbacks();
  var frameworkMessageType = framework == 'tcfv2' ? 'gdpr' : 'ccpa';
  log$1('cmp', "framework: ".concat(framework));
  log$1('cmp', "frameworkMessageType: ".concat(frameworkMessageType));
  window._sp_queue = [];
  window._sp_ = {
    config: {
      baseEndpoint: ENDPOINT,
      accountId: ACCOUNT_ID,
      propertyHref: getProperty(framework),
      targetingParams: {
        framework
      },
      pubData: _objectSpread2(_objectSpread2({}, pubData), {}, {
        cmpInitTimeUtc: new Date().getTime()
      }),
      events: {
        onConsentReady: (message_type, consentUUID, euconsent) => {
          log$1('cmp', "onConsentReady ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          log$1('cmp', "consentUUID ".concat(consentUUID));
          log$1('cmp', "euconsent ".concat(euconsent));
          mark('cmp-got-consent');
          setTimeout(invokeCallbacks, 0);
        },
        onMessageReady: message_type => {
          log$1('cmp', "onMessageReady ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          mark('cmp-ui-displayed');
        },
        onMessageReceiveData: (message_type, data) => {
          log$1('cmp', "onMessageReceiveData ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          log$1('cmp', 'onMessageReceiveData ', data);
          void resolveWillShowPrivacyMessage(data.messageId !== 0);
        },
        onMessageChoiceSelect: (message_type, choice_id, choiceTypeID) => {
          log$1('cmp', "onMessageChoiceSelect message_type: ".concat(message_type));
          console.log();
          if (message_type != frameworkMessageType) return;
          log$1('cmp', "onMessageChoiceSelect choice_id: ".concat(choice_id));
          log$1('cmp', "onMessageChoiceSelect choice_type_id: ".concat(choiceTypeID));

          if (choiceTypeID === 11 || choiceTypeID === 13 || choiceTypeID === 15) {
            setTimeout(invokeCallbacks, 0);
          }
        },
        onPrivacyManagerAction: function onPrivacyManagerAction(message_type, pmData) {
          log$1('cmp', "onPrivacyManagerAction message_type: ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          log$1('cmp', "onPrivacyManagerAction ".concat(pmData));
        },
        onMessageChoiceError: function onMessageChoiceError(message_type, err) {
          log$1('cmp', "onMessageChoiceError ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          log$1('cmp', "onMessageChoiceError ".concat(err));
        },
        onPMCancel: function onPMCancel(message_type) {
          log$1('cmp', "onPMCancel ".concat(message_type));
          if (message_type != frameworkMessageType) return;
        },
        onSPPMObjectReady: function onSPPMObjectReady() {
          log$1('cmp', 'onSPPMObjectReady');
        },
        onError: function onError(message_type, errorCode, errorObject, userReset) {
          log$1('cmp', "errorCode: ".concat(message_type));
          if (message_type != frameworkMessageType) return;
          log$1('cmp', "errorCode: ".concat(errorCode));
          log$1('cmp', errorObject);
          log$1('cmp', "userReset: ".concat(userReset));
        }
      }
    }
  };

  if (framework === 'tcfv2') {
    window._sp_.config.gdpr = {
      targetingParams: {
        framework
      }
    };
  } else {
    window._sp_.config.ccpa = {
      targetingParams: {
        framework
      }
    };
  }

  var spLib = document.createElement('script');
  spLib.id = 'sourcepoint-lib';
  spLib.src = "".concat(ENDPOINT, "/unified/wrapperMessagingWithoutDetection.js");
  document.body.appendChild(spLib);
};

var init$1 = (framework, pubData) => {
  mark('cmp-init');
  init$2(framework, pubData);
};

var willShowPrivacyMessage$1 = () => willShowPrivacyMessage$2;

function showPrivacyManager$1() {
  var _window$_sp_, _window$_sp_$gdpr, _window$_sp_$gdpr$loa, _window$_sp_2, _window$_sp_2$ccpa, _window$_sp_2$ccpa$lo, _window$_sp_3, _window$_sp_3$ccpa, _window$_sp_3$ccpa$lo;

  switch (getCurrentFramework()) {
    case 'tcfv2':
      (_window$_sp_ = window._sp_) === null || _window$_sp_ === void 0 ? void 0 : (_window$_sp_$gdpr = _window$_sp_.gdpr) === null || _window$_sp_$gdpr === void 0 ? void 0 : (_window$_sp_$gdpr$loa = _window$_sp_$gdpr.loadPrivacyManagerModal) === null || _window$_sp_$gdpr$loa === void 0 ? void 0 : _window$_sp_$gdpr$loa.call(_window$_sp_$gdpr, PRIVACY_MANAGER_TCFV2);
      break;

    case 'ccpa':
      (_window$_sp_2 = window._sp_) === null || _window$_sp_2 === void 0 ? void 0 : (_window$_sp_2$ccpa = _window$_sp_2.ccpa) === null || _window$_sp_2$ccpa === void 0 ? void 0 : (_window$_sp_2$ccpa$lo = _window$_sp_2$ccpa.loadPrivacyManagerModal) === null || _window$_sp_2$ccpa$lo === void 0 ? void 0 : _window$_sp_2$ccpa$lo.call(_window$_sp_2$ccpa, PRIVACY_MANAGER_CCPA);
      break;

    case 'aus':
      (_window$_sp_3 = window._sp_) === null || _window$_sp_3 === void 0 ? void 0 : (_window$_sp_3$ccpa = _window$_sp_3.ccpa) === null || _window$_sp_3$ccpa === void 0 ? void 0 : (_window$_sp_3$ccpa$lo = _window$_sp_3$ccpa.loadPrivacyManagerModal) === null || _window$_sp_3$ccpa$lo === void 0 ? void 0 : _window$_sp_3$ccpa$lo.call(_window$_sp_3$ccpa, PRIVACY_MANAGER_AUSTRALIA);
      break;
  }
}

var CMP = {
  init: init$1,
  willShowPrivacyMessage: willShowPrivacyMessage$1,
  showPrivacyManager: showPrivacyManager$1
};
var COOKIE_NAME = 'gu-cmp-disabled';

var disable = () => {
  document.cookie = "".concat(COOKIE_NAME, "=true");
};

var enable = () => {
  document.cookie = "".concat(COOKIE_NAME, "=false");
};

var isDisabled = () => new RegExp("".concat(COOKIE_NAME, "=true(\\W+|$)")).test(document.cookie);

var VendorIDs = {
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
  'youtube-player': ['5e7ac3fae30e7d1bc1ebf5e8']
};

var getConsentFor$1 = (vendor, consent) => {
  var _consent$tcfv2;

  var sourcepointIds = VendorIDs[vendor];

  if (typeof sourcepointIds === 'undefined' || sourcepointIds === []) {
    throw new Error("Vendor '".concat(vendor, "' not found, or with no Sourcepoint ID. ") + 'If it should be added, raise an issue at https://github.com/guardian/consent-management-platform/issues');
  }

  if (consent.ccpa) {
    return !consent.ccpa.doNotSell;
  }

  if (consent.aus) {
    return consent.aus.personalisedAdvertising;
  }

  var foundSourcepointId = sourcepointIds.find(id => {
    var _consent$tcfv;

    return typeof ((_consent$tcfv = consent.tcfv2) === null || _consent$tcfv === void 0 ? void 0 : _consent$tcfv.vendorConsents[id]) !== 'undefined';
  });

  if (typeof foundSourcepointId === 'undefined') {
    console.warn("No consent returned from Sourcepoint for vendor: '".concat(vendor, "'"));
    return false;
  }

  var tcfv2Consent = (_consent$tcfv2 = consent.tcfv2) === null || _consent$tcfv2 === void 0 ? void 0 : _consent$tcfv2.vendorConsents[foundSourcepointId];

  if (typeof tcfv2Consent === 'undefined') {
    console.warn("No consent returned from Sourcepoint for vendor: '".concat(vendor, "'"));
    return false;
  }

  return tcfv2Consent;
};

var getFramework = countryCode => {
  var framework;

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

var onConsent$1 = () => new Promise((resolve, reject) => {
  onConsentChange$1(consentState => {
    if (consentState.tcfv2 || consentState.ccpa || consentState.aus) {
      resolve(consentState);
    }

    reject('Unknown framework');
  });
});

var _a$3, _b, _c, _d;

if (!isServerSide) {
  window.guCmpHotFix || (window.guCmpHotFix = {});
}

var _willShowPrivacyMessage;

var initComplete = false;
var resolveInitialised;
var initialised = new Promise(resolve => {
  resolveInitialised = resolve;
});

var init = _ref5 => {
  var {
    pubData,
    country
  } = _ref5;
  if (isDisabled() || isServerSide) return;

  if (window.guCmpHotFix.initialised) {
    var _window$guCmpHotFix$c, _window$guCmpHotFix$c2;

    if (((_window$guCmpHotFix$c = window.guCmpHotFix.cmp) === null || _window$guCmpHotFix$c === void 0 ? void 0 : _window$guCmpHotFix$c.version) !== "0.0.0-this-never-updates-in-source-code-refer-to-git-tags") console.warn('Two different versions of the CMP are running:', ["0.0.0-this-never-updates-in-source-code-refer-to-git-tags", (_window$guCmpHotFix$c2 = window.guCmpHotFix.cmp) === null || _window$guCmpHotFix$c2 === void 0 ? void 0 : _window$guCmpHotFix$c2.version]);
    return;
  }

  window.guCmpHotFix.initialised = true;

  if (typeof country === 'undefined') {
    throw new Error('CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.');
  }

  var framework = getFramework(country);
  CMP.init(framework, pubData !== null && pubData !== void 0 ? pubData : {});
  void CMP.willShowPrivacyMessage().then(willShowValue => {
    _willShowPrivacyMessage = willShowValue;
    initComplete = true;
    log$1('cmp', 'initComplete');
  });
  resolveInitialised();
};

var willShowPrivacyMessage = () => initialised.then(() => CMP.willShowPrivacyMessage());

var willShowPrivacyMessageSync = () => {
  if (_willShowPrivacyMessage !== undefined) {
    return _willShowPrivacyMessage;
  }

  throw new Error('CMP has not been initialised. Use the async willShowPrivacyMessage() instead.');
};

var hasInitialised = () => initComplete;

var showPrivacyManager = () => {
  void initialised.then(CMP.showPrivacyManager);
};

var cmp = isServerSide ? cmp$1 : (_a$3 = window.guCmpHotFix).cmp || (_a$3.cmp = {
  init,
  willShowPrivacyMessage,
  willShowPrivacyMessageSync,
  hasInitialised,
  showPrivacyManager,
  version: "0.0.0-this-never-updates-in-source-code-refer-to-git-tags",
  __isDisabled: isDisabled,
  __enable: enable,
  __disable: disable
});
isServerSide ? onConsent$2 : (_b = window.guCmpHotFix).onConsent || (_b.onConsent = onConsent$1);
var onConsentChange = isServerSide ? onConsentChange$2 : (_c = window.guCmpHotFix).onConsentChange || (_c.onConsentChange = onConsentChange$1);
isServerSide ? getConsentFor$2 : (_d = window.guCmpHotFix).getConsentFor || (_d.getConsentFor = getConsentFor$1);

var __classPrivateFieldSet = undefined && undefined.__classPrivateFieldSet || function (receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};

var __classPrivateFieldGet = undefined && undefined.__classPrivateFieldGet || function (receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};

var _StorageFactory_storage, _local, _session, _a$1;

class StorageFactory {
  constructor(storage) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
    _StorageFactory_storage.set(this, void 0);

    try {
      var uid = new Date().toString();
      storage.setItem(uid, uid);
      var available = storage.getItem(uid) == uid;
      storage.removeItem(uid);
      if (available) __classPrivateFieldSet(this, _StorageFactory_storage, storage, "f");
    } catch (e) {// do nothing
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
      var _classPrivateFieldGe, _classPrivateFieldGe2;

      var {
        value,
        expires
      } = JSON.parse((_classPrivateFieldGe = (_classPrivateFieldGe2 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe2 === void 0 ? void 0 : _classPrivateFieldGe2.getItem(key)) !== null && _classPrivateFieldGe !== void 0 ? _classPrivateFieldGe : ''); // is this item has passed its sell-by-date, remove it

      if (expires && new Date() > new Date(expires)) {
        this.remove(key);
        return null;
      }

      return value;
    } catch (e) {
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
    var _classPrivateFieldGe3;

    return (_classPrivateFieldGe3 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe3 === void 0 ? void 0 : _classPrivateFieldGe3.setItem(key, JSON.stringify({
      value,
      expires
    }));
  }
  /**
   * Remove an item from storage.
   *
   * @param key - the name of the item
   */


  remove(key) {
    var _classPrivateFieldGe4;

    return (_classPrivateFieldGe4 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe4 === void 0 ? void 0 : _classPrivateFieldGe4.removeItem(key);
  }
  /**
   * Removes all items from storage.
   */


  clear() {
    var _classPrivateFieldGe5;

    return (_classPrivateFieldGe5 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe5 === void 0 ? void 0 : _classPrivateFieldGe5.clear();
  }
  /**
   * Retrieve an item from storage in its raw state.
   *
   * @param key - the name of the item
   */


  getRaw(key) {
    var _classPrivateFieldGe6, _classPrivateFieldGe7;

    return (_classPrivateFieldGe6 = (_classPrivateFieldGe7 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe7 === void 0 ? void 0 : _classPrivateFieldGe7.getItem(key)) !== null && _classPrivateFieldGe6 !== void 0 ? _classPrivateFieldGe6 : null;
  }
  /**
   * Save a raw value to storage.
   *
   * @param key - the name of the item
   * @param value - the data to save
   */


  setRaw(key, value) {
    var _classPrivateFieldGe8;

    return (_classPrivateFieldGe8 = __classPrivateFieldGet(this, _StorageFactory_storage, "f")) === null || _classPrivateFieldGe8 === void 0 ? void 0 : _classPrivateFieldGe8.setItem(key, value);
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

var storage = new (_a$1 = class {
  constructor() {
    _local.set(this, void 0);

    _session.set(this, void 0);
  } // creating the instance requires testing the native implementation
  // which is blocking. therefore, only create new instances of the factory
  // when it's accessed i.e. we know we're going to use it


  get local() {
    return __classPrivateFieldSet(this, _local, __classPrivateFieldGet(this, _local, "f") || new StorageFactory(localStorage), "f");
  }

  get session() {
    return __classPrivateFieldSet(this, _session, __classPrivateFieldGet(this, _session, "f") || new StorageFactory(sessionStorage), "f");
  }

}, _local = new WeakMap(), _session = new WeakMap(), _a$1)();

/**
 * You can only subscribe to teams from this list.
 * Add your team name below to start logging.
 *
 * Make sure your label has a contrast ratio of 4.5 or more.
 * */
var teams = {
  common: {
    background: '#052962',
    font: '#ffffff'
  },
  commercial: {
    background: '#77EEAA',
    font: '#004400'
  },
  cmp: {
    background: '#FF6BB5',
    font: '#2F0404'
  },
  dotcom: {
    background: '#000000',
    font: '#ff7300'
  },
  design: {
    background: '#185E36',
    font: '#FFF4F2'
  },
  tx: {
    background: '#2F4F4F',
    font: '#FFFFFF'
  }
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
var _a;
var KEY = 'gu.logger';
var teamColours = teams;

var style = team => {
  var {
    background,
    font
  } = teamColours[team];
  return "background: ".concat(background, "; color: ").concat(font, "; padding: 2px 3px; border-radius:3px");
};
/**
 * Runs in all environments, if local storage values are set.
 */

var log = function log(team) {
  // TODO add check for localStorage
  if (!(storage.local.get(KEY) || '').includes(team)) return;
  var styles = [style('common'), '', style(team), ''];

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  console.log("%c@guardian%c %c".concat(team, "%c"), ...styles, ...args);
};
/**
 * Subscribe to a team’s log
 * @param team the team’s unique ID
 */

var subscribeTo = team => {
  var teamSubscriptions = storage.local.get(KEY) ? storage.local.get(KEY).split(',') : [];
  if (!teamSubscriptions.includes(team)) teamSubscriptions.push(team);
  storage.local.set(KEY, teamSubscriptions.join(','));
  log(team, '🔔 Subscribed, hello!');
};
/**
 * Unsubscribe to a team’s log
 * @param team the team’s unique ID
 */


var unsubscribeFrom = team => {
  log(team, '🔕 Unsubscribed, good-bye!');
  var teamSubscriptions = storage.local.get(KEY).split(',').filter(t => t !== team);
  storage.local.set(KEY, teamSubscriptions.join(','));
};
/* istanbul ignore next */


if (typeof window !== 'undefined') {
  window.guardian || (window.guardian = {});
  (_a = window.guardian).logger || (_a.logger = {
    subscribeTo,
    unsubscribeFrom,
    teams: () => Object.keys(teamColours)
  });
}

/* test-page/App.svelte generated by Svelte v3.38.2 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i].title;
	child_ctx[11] = list[i].payload;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i][0];
	child_ctx[15] = list[i][1];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i][0];
	child_ctx[15] = list[i][1];
	return child_ctx;
}

// (171:2) {:else}
function create_else_block(ctx) {
	let h2;

	return {
		c() {
			h2 = element("h2");
			h2.textContent = "¯\\_(ツ)_/¯";
			attr(h2, "class", "svelte-hrypa8");
		},
		m(target, anchor) {
			insert(target, h2, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(h2);
		}
	};
}

// (163:29) 
function create_if_block_2(ctx) {
	let h2;
	let t1;
	let span;
	let t2_value = /*consentState*/ ctx[2].aus.personalisedAdvertising + "";
	let t2;
	let span_data_personalised_advertising_value;
	let span_class_value;

	return {
		c() {
			h2 = element("h2");
			h2.textContent = "aus.personalisedAdvertising";
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			attr(h2, "class", "svelte-hrypa8");
			attr(span, "data-personalised-advertising", span_data_personalised_advertising_value = /*consentState*/ ctx[2].aus.personalisedAdvertising);

			attr(span, "class", span_class_value = "" + (null_to_empty(/*consentState*/ ctx[2].aus.personalisedAdvertising
			? "yes"
			: "no") + " svelte-hrypa8"));
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			insert(target, t1, anchor);
			insert(target, span, anchor);
			append(span, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*consentState*/ 4 && t2_value !== (t2_value = /*consentState*/ ctx[2].aus.personalisedAdvertising + "")) set_data(t2, t2_value);

			if (dirty & /*consentState*/ 4 && span_data_personalised_advertising_value !== (span_data_personalised_advertising_value = /*consentState*/ ctx[2].aus.personalisedAdvertising)) {
				attr(span, "data-personalised-advertising", span_data_personalised_advertising_value);
			}

			if (dirty & /*consentState*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(/*consentState*/ ctx[2].aus.personalisedAdvertising
			? "yes"
			: "no") + " svelte-hrypa8"))) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(h2);
			if (detaching) detach(t1);
			if (detaching) detach(span);
		}
	};
}

// (158:30) 
function create_if_block_1(ctx) {
	let h2;
	let t1;
	let span;
	let t2_value = /*consentState*/ ctx[2].ccpa.doNotSell + "";
	let t2;
	let span_data_donotsell_value;

	return {
		c() {
			h2 = element("h2");
			h2.textContent = "ccpa.doNotSell";
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			attr(h2, "class", "svelte-hrypa8");
			attr(span, "class", "label svelte-hrypa8");
			attr(span, "data-donotsell", span_data_donotsell_value = /*consentState*/ ctx[2].ccpa.doNotSell);
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			insert(target, t1, anchor);
			insert(target, span, anchor);
			append(span, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*consentState*/ 4 && t2_value !== (t2_value = /*consentState*/ ctx[2].ccpa.doNotSell + "")) set_data(t2, t2_value);

			if (dirty & /*consentState*/ 4 && span_data_donotsell_value !== (span_data_donotsell_value = /*consentState*/ ctx[2].ccpa.doNotSell)) {
				attr(span, "data-donotsell", span_data_donotsell_value);
			}
		},
		d(detaching) {
			if (detaching) detach(h2);
			if (detaching) detach(t1);
			if (detaching) detach(span);
		}
	};
}

// (141:2) {#if consentState.tcfv2}
function create_if_block(ctx) {
	let h20;
	let t1;
	let span;
	let t2_value = /*consentState*/ ctx[2].tcfv2.eventStatus + "";
	let t2;
	let t3;
	let h21;
	let t5;
	let t6;
	let h22;
	let t8;
	let each1_anchor;
	let each_value_2 = Object.entries(/*consentState*/ ctx[2].tcfv2.consents);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let each_value_1 = Object.entries(/*consentState*/ ctx[2].tcfv2.vendorConsents);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			h20 = element("h2");
			h20.textContent = "tcfv2.eventStatus";
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			t3 = space();
			h21 = element("h2");
			h21.textContent = "tcfv2.consents";
			t5 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t6 = space();
			h22 = element("h2");
			h22.textContent = "tcfv2.vendorConsents";
			t8 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each1_anchor = empty();
			attr(h20, "class", "svelte-hrypa8");
			attr(span, "class", "label svelte-hrypa8");
			attr(h21, "class", "svelte-hrypa8");
			attr(h22, "class", "svelte-hrypa8");
		},
		m(target, anchor) {
			insert(target, h20, anchor);
			insert(target, t1, anchor);
			insert(target, span, anchor);
			append(span, t2);
			insert(target, t3, anchor);
			insert(target, h21, anchor);
			insert(target, t5, anchor);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(target, anchor);
			}

			insert(target, t6, anchor);
			insert(target, h22, anchor);
			insert(target, t8, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*consentState*/ 4 && t2_value !== (t2_value = /*consentState*/ ctx[2].tcfv2.eventStatus + "")) set_data(t2, t2_value);

			if (dirty & /*JSON, Object, consentState*/ 4) {
				each_value_2 = Object.entries(/*consentState*/ ctx[2].tcfv2.consents);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_2(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(t6.parentNode, t6);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_2.length;
			}

			if (dirty & /*JSON, Object, consentState*/ 4) {
				each_value_1 = Object.entries(/*consentState*/ ctx[2].tcfv2.vendorConsents);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) detach(h20);
			if (detaching) detach(t1);
			if (detaching) detach(span);
			if (detaching) detach(t3);
			if (detaching) detach(h21);
			if (detaching) detach(t5);
			destroy_each(each_blocks_1, detaching);
			if (detaching) detach(t6);
			if (detaching) detach(h22);
			if (detaching) detach(t8);
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each1_anchor);
		}
	};
}

// (146:3) {#each Object.entries(consentState.tcfv2.consents) as [purpose, state]}
function create_each_block_2(ctx) {
	let span;
	let t_value = /*purpose*/ ctx[18] + "";
	let t;
	let span_class_value;
	let span_data_purpose_value;
	let span_data_consent_value;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", span_class_value = "" + (null_to_empty(JSON.parse(/*state*/ ctx[15]) ? "yes" : "no") + " svelte-hrypa8"));
			attr(span, "data-purpose", span_data_purpose_value = /*purpose*/ ctx[18]);
			attr(span, "data-consent", span_data_consent_value = /*state*/ ctx[15]);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*consentState*/ 4 && t_value !== (t_value = /*purpose*/ ctx[18] + "")) set_data(t, t_value);

			if (dirty & /*consentState*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(JSON.parse(/*state*/ ctx[15]) ? "yes" : "no") + " svelte-hrypa8"))) {
				attr(span, "class", span_class_value);
			}

			if (dirty & /*consentState*/ 4 && span_data_purpose_value !== (span_data_purpose_value = /*purpose*/ ctx[18])) {
				attr(span, "data-purpose", span_data_purpose_value);
			}

			if (dirty & /*consentState*/ 4 && span_data_consent_value !== (span_data_consent_value = /*state*/ ctx[15])) {
				attr(span, "data-consent", span_data_consent_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (155:3) {#each Object.entries(consentState.tcfv2.vendorConsents) as [consent, state]}
function create_each_block_1(ctx) {
	let span;
	let t_value = /*consent*/ ctx[14] + "";
	let t;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", span_class_value = "" + (null_to_empty(JSON.parse(/*state*/ ctx[15]) ? "yes" : "no") + " svelte-hrypa8"));
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*consentState*/ 4 && t_value !== (t_value = /*consent*/ ctx[14] + "")) set_data(t, t_value);

			if (dirty & /*consentState*/ 4 && span_class_value !== (span_class_value = "" + (null_to_empty(JSON.parse(/*state*/ ctx[15]) ? "yes" : "no") + " svelte-hrypa8"))) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (177:2) {#each eventsList as { title, payload }}
function create_each_block(ctx) {
	let li;
	let details;
	let summary;
	let t0_value = /*title*/ ctx[10] + "";
	let t0;
	let t1;
	let pre;
	let t2_value = JSON.stringify(/*payload*/ ctx[11], null, 4) + "";
	let t2;
	let t3;

	return {
		c() {
			li = element("li");
			details = element("details");
			summary = element("summary");
			t0 = text(t0_value);
			t1 = space();
			pre = element("pre");
			t2 = text(t2_value);
			t3 = space();
			attr(summary, "class", "svelte-hrypa8");
			attr(pre, "class", "svelte-hrypa8");
			attr(details, "class", "svelte-hrypa8");
			attr(li, "class", "svelte-hrypa8");
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, details);
			append(details, summary);
			append(summary, t0);
			append(details, t1);
			append(details, pre);
			append(pre, t2);
			append(li, t3);
		},
		p(ctx, dirty) {
			if (dirty & /*eventsList*/ 2 && t0_value !== (t0_value = /*title*/ ctx[10] + "")) set_data(t0, t0_value);
			if (dirty & /*eventsList*/ 2 && t2_value !== (t2_value = JSON.stringify(/*payload*/ ctx[11], null, 4) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) detach(li);
		}
	};
}

function create_fragment(ctx) {
	let main;
	let nav;
	let button0;
	let t1;
	let button1;
	let t3;
	let label0;
	let input0;
	let t4;
	let strong0;
	let label0_class_value;
	let t6;
	let label1;
	let input1;
	let t7;
	let strong1;
	let label1_class_value;
	let t9;
	let label2;
	let input2;
	let t10;
	let strong2;
	let label2_class_value;
	let t12;
	let div;
	let t13;
	let ol;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*consentState*/ ctx[2].tcfv2) return create_if_block;
		if (/*consentState*/ ctx[2].ccpa) return create_if_block_1;
		if (/*consentState*/ ctx[2].aus) return create_if_block_2;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);
	let each_value = /*eventsList*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			main = element("main");
			nav = element("nav");
			button0 = element("button");
			button0.textContent = "open privacy manager";
			t1 = space();
			button1 = element("button");
			button1.textContent = "clear preferences";
			t3 = space();
			label0 = element("label");
			input0 = element("input");
			t4 = text("\n\t\t\tin RoW:");
			strong0 = element("strong");
			strong0.textContent = "TCFv2";
			t6 = space();
			label1 = element("label");
			input1 = element("input");
			t7 = text("\n\t\t\tin USA:\n\t\t\t");
			strong1 = element("strong");
			strong1.textContent = "CCPA";
			t9 = space();
			label2 = element("label");
			input2 = element("input");
			t10 = text("\n\t\t\tin Australia:\n\t\t\t");
			strong2 = element("strong");
			strong2.textContent = "CCPA-like";
			t12 = space();
			div = element("div");
			if_block.c();
			t13 = space();
			ol = element("ol");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(button0, "data-cy", "pm");
			attr(button0, "class", "svelte-hrypa8");
			attr(button1, "class", "svelte-hrypa8");
			attr(input0, "type", "radio");
			input0.__value = "tcfv2";
			input0.value = input0.__value;
			attr(input0, "class", "svelte-hrypa8");
			/*$$binding_groups*/ ctx[6][0].push(input0);
			attr(strong0, "class", "svelte-hrypa8");
			attr(label0, "class", label0_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "tcfv2" ? "selected" : "none") + " svelte-hrypa8"));
			attr(input1, "type", "radio");
			input1.__value = "ccpa";
			input1.value = input1.__value;
			attr(input1, "class", "svelte-hrypa8");
			/*$$binding_groups*/ ctx[6][0].push(input1);
			attr(strong1, "class", "svelte-hrypa8");
			attr(label1, "class", label1_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "ccpa" ? "selected" : "none") + " svelte-hrypa8"));
			attr(input2, "type", "radio");
			input2.__value = "aus";
			input2.value = input2.__value;
			attr(input2, "class", "svelte-hrypa8");
			/*$$binding_groups*/ ctx[6][0].push(input2);
			attr(strong2, "class", "svelte-hrypa8");
			attr(label2, "class", label2_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "aus" ? "selected" : "none") + " svelte-hrypa8"));
			attr(nav, "class", "svelte-hrypa8");
			attr(div, "id", "consent-state");
			attr(div, "class", "svelte-hrypa8");
			attr(ol, "id", "events");
			attr(ol, "class", "svelte-hrypa8");
			attr(main, "class", "svelte-hrypa8");
		},
		m(target, anchor) {
			insert(target, main, anchor);
			append(main, nav);
			append(nav, button0);
			append(nav, t1);
			append(nav, button1);
			append(nav, t3);
			append(nav, label0);
			append(label0, input0);
			input0.checked = input0.__value === /*framework*/ ctx[0];
			append(label0, t4);
			append(label0, strong0);
			append(nav, t6);
			append(nav, label1);
			append(label1, input1);
			input1.checked = input1.__value === /*framework*/ ctx[0];
			append(label1, t7);
			append(label1, strong1);
			append(nav, t9);
			append(nav, label2);
			append(label2, input2);
			input2.checked = input2.__value === /*framework*/ ctx[0];
			append(label2, t10);
			append(label2, strong2);
			append(main, t12);
			append(main, div);
			if_block.m(div, null);
			append(main, t13);
			append(main, ol);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ol, null);
			}

			if (!mounted) {
				dispose = [
					listen(button0, "click", cmp.showPrivacyManager),
					listen(button1, "click", /*clearPreferences*/ ctx[3]),
					listen(input0, "change", /*input0_change_handler*/ ctx[5]),
					listen(input0, "change", /*setLocation*/ ctx[4]),
					listen(input1, "change", /*input1_change_handler*/ ctx[7]),
					listen(input1, "change", /*setLocation*/ ctx[4]),
					listen(input2, "change", /*input2_change_handler*/ ctx[8]),
					listen(input2, "change", /*setLocation*/ ctx[4])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*framework*/ 1) {
				input0.checked = input0.__value === /*framework*/ ctx[0];
			}

			if (dirty & /*framework*/ 1 && label0_class_value !== (label0_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "tcfv2" ? "selected" : "none") + " svelte-hrypa8"))) {
				attr(label0, "class", label0_class_value);
			}

			if (dirty & /*framework*/ 1) {
				input1.checked = input1.__value === /*framework*/ ctx[0];
			}

			if (dirty & /*framework*/ 1 && label1_class_value !== (label1_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "ccpa" ? "selected" : "none") + " svelte-hrypa8"))) {
				attr(label1, "class", label1_class_value);
			}

			if (dirty & /*framework*/ 1) {
				input2.checked = input2.__value === /*framework*/ ctx[0];
			}

			if (dirty & /*framework*/ 1 && label2_class_value !== (label2_class_value = "" + (null_to_empty(/*framework*/ ctx[0] == "aus" ? "selected" : "none") + " svelte-hrypa8"))) {
				attr(label2, "class", label2_class_value);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}

			if (dirty & /*JSON, eventsList*/ 2) {
				each_value = /*eventsList*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(ol, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(main);
			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input0), 1);
			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input1), 1);
			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input2), 1);
			if_block.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let consentState;
	let eventsList;

	switch (window.location.hash) {
		case "#tcfv2":
			localStorage.setItem("framework", JSON.stringify("tcfv2"));
			break;
		case "#ccpa":
			localStorage.setItem("framework", JSON.stringify("ccpa"));
			break;
		case "#aus":
			localStorage.setItem("framework", JSON.stringify("aus"));
			break;
		default:
			window.location.hash = "tcfv2";
			localStorage.setItem("framework", JSON.stringify("tcfv2"));
			break;
	}

	window.guardian.logger.subscribeTo("cmp");

	// allow us to listen to changes on window.guCmpHotFix
	window.guCmpHotFix = new Proxy(window.guCmpHotFix,
	{
			set(target, key, value) {
				target[key] = value;
				console.info("%cwindow.guCmpHotFix", "color: deeppink;", { ...window.guCmpHotFix });
				return true;
			}
		});

	function logEvent(event) {
		$$invalidate(1, eventsList = [...eventsList, event]);
		log("cmp", event);
	}

	let clearPreferences = () => {
		// clear local storage
		// https://documentation.sourcepoint.com/web-implementation/general/cookies-and-local-storage#cmp-local-storage
		localStorage.clear();

		// clear cookies
		// https://documentation.sourcepoint.com/web-implementation/general/cookies-and-local-storage#cmp-cookies
		document.cookie.split(";").forEach(cookie => {
			document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
		});

		window.location.reload();
	};

	let framework = JSON.parse(localStorage.getItem("framework"));

	let setLocation = () => {
		localStorage.setItem("framework", JSON.stringify(framework));
		window.location.hash = framework;
		clearPreferences();
	};

	cmp.willShowPrivacyMessage().then(willShow => {
		logEvent({
			title: "cmp.willShowPrivacyMessage",
			payload: willShow
		});
	});

	onConsentChange(payload => {
		logEvent({ title: "onConsentChange", payload });
		$$invalidate(2, consentState = payload);
	});

	onMount(async () => {
		// Set the country based on chosen framework.
		// This is not to be used in production
		let country = "";

		switch (framework) {
			case "tcfv2":
				country = "GB";
				break;
			case "ccpa":
				country = "US";
				break;
			case "aus":
				country = "AU";
				break;
		}

		// do this loads to make sure that doesn't break things
		cmp.init({ country });

		cmp.init({ country });
		cmp.init({ country });
		cmp.init({ country });
	});

	const $$binding_groups = [[]];

	function input0_change_handler() {
		framework = this.__value;
		$$invalidate(0, framework);
	}

	function input1_change_handler() {
		framework = this.__value;
		$$invalidate(0, framework);
	}

	function input2_change_handler() {
		framework = this.__value;
		$$invalidate(0, framework);
	}

	$$invalidate(2, consentState = {});
	$$invalidate(1, eventsList = []);

	return [
		framework,
		eventsList,
		consentState,
		clearPreferences,
		setLocation,
		input0_change_handler,
		$$binding_groups,
		input1_change_handler,
		input2_change_handler
	];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		init$3(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

var app = new App({
  target: document.body
});

export { app as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvaW50ZXJuYWwvaW5kZXgubWpzIiwiLi4vLi4vZGlzdC9pbmRleC5lc20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGd1YXJkaWFuL2xpYnMvZGlzdC9lc20vc3RvcmFnZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9AZ3VhcmRpYW4vbGlicy9kaXN0L2VzbS9sb2dnZXIudGVhbXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGd1YXJkaWFuL2xpYnMvZGlzdC9lc20vbG9nZ2VyLmpzIiwiLi4vQXBwLnN2ZWx0ZSIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5vb3AoKSB7IH1cbmNvbnN0IGlkZW50aXR5ID0geCA9PiB4O1xuZnVuY3Rpb24gYXNzaWduKHRhciwgc3JjKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvciAoY29uc3QgayBpbiBzcmMpXG4gICAgICAgIHRhcltrXSA9IHNyY1trXTtcbiAgICByZXR1cm4gdGFyO1xufVxuZnVuY3Rpb24gaXNfcHJvbWlzZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYWRkX2xvY2F0aW9uKGVsZW1lbnQsIGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhcikge1xuICAgIGVsZW1lbnQuX19zdmVsdGVfbWV0YSA9IHtcbiAgICAgICAgbG9jOiB7IGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhciB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJ1bihmbikge1xuICAgIHJldHVybiBmbigpO1xufVxuZnVuY3Rpb24gYmxhbmtfb2JqZWN0KCkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gcnVuX2FsbChmbnMpIHtcbiAgICBmbnMuZm9yRWFjaChydW4pO1xufVxuZnVuY3Rpb24gaXNfZnVuY3Rpb24odGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gc2FmZV9ub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiIHx8ICgoYSAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBhID09PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIG5vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGI7XG59XG5mdW5jdGlvbiBpc19lbXB0eShvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zdG9yZShzdG9yZSwgbmFtZSkge1xuICAgIGlmIChzdG9yZSAhPSBudWxsICYmIHR5cGVvZiBzdG9yZS5zdWJzY3JpYmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtuYW1lfScgaXMgbm90IGEgc3RvcmUgd2l0aCBhICdzdWJzY3JpYmUnIG1ldGhvZGApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHN1YnNjcmliZShzdG9yZSwgLi4uY2FsbGJhY2tzKSB7XG4gICAgaWYgKHN0b3JlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuICAgIGNvbnN0IHVuc3ViID0gc3RvcmUuc3Vic2NyaWJlKC4uLmNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHVuc3ViLnVuc3Vic2NyaWJlID8gKCkgPT4gdW5zdWIudW5zdWJzY3JpYmUoKSA6IHVuc3ViO1xufVxuZnVuY3Rpb24gZ2V0X3N0b3JlX3ZhbHVlKHN0b3JlKSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIHN1YnNjcmliZShzdG9yZSwgXyA9PiB2YWx1ZSA9IF8pKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gY29tcG9uZW50X3N1YnNjcmliZShjb21wb25lbnQsIHN0b3JlLCBjYWxsYmFjaykge1xuICAgIGNvbXBvbmVudC4kJC5vbl9kZXN0cm95LnB1c2goc3Vic2NyaWJlKHN0b3JlLCBjYWxsYmFjaykpO1xufVxuZnVuY3Rpb24gY3JlYXRlX3Nsb3QoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY3R4ID0gZ2V0X3Nsb3RfY29udGV4dChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKTtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25bMF0oc2xvdF9jdHgpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIHJldHVybiBkZWZpbml0aW9uWzFdICYmIGZuXG4gICAgICAgID8gYXNzaWduKCQkc2NvcGUuY3R4LnNsaWNlKCksIGRlZmluaXRpb25bMV0oZm4oY3R4KSkpXG4gICAgICAgIDogJCRzY29wZS5jdHg7XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jaGFuZ2VzKGRlZmluaXRpb24sICQkc2NvcGUsIGRpcnR5LCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uWzJdICYmIGZuKSB7XG4gICAgICAgIGNvbnN0IGxldHMgPSBkZWZpbml0aW9uWzJdKGZuKGRpcnR5KSk7XG4gICAgICAgIGlmICgkJHNjb3BlLmRpcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsZXRzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbGV0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gTWF0aC5tYXgoJCRzY29wZS5kaXJ0eS5sZW5ndGgsIGxldHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSAkJHNjb3BlLmRpcnR5W2ldIHwgbGV0c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQkc2NvcGUuZGlydHkgfCBsZXRzO1xuICAgIH1cbiAgICByZXR1cm4gJCRzY29wZS5kaXJ0eTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgaWYgKHNsb3RfY2hhbmdlcykge1xuICAgICAgICBjb25zdCBzbG90X2NvbnRleHQgPSBnZXRfc2xvdF9jb250ZXh0KHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbiAgICAgICAgc2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcbiAgICB9XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9zcHJlYWQoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGRpcnR5LCBnZXRfc2xvdF9jaGFuZ2VzX2ZuLCBnZXRfc2xvdF9zcHJlYWRfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X3NwcmVhZF9jaGFuZ2VzX2ZuKGRpcnR5KSB8IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgaWYgKHNsb3RfY2hhbmdlcykge1xuICAgICAgICBjb25zdCBzbG90X2NvbnRleHQgPSBnZXRfc2xvdF9jb250ZXh0KHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbiAgICAgICAgc2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcbiAgICB9XG59XG5mdW5jdGlvbiBleGNsdWRlX2ludGVybmFsX3Byb3BzKHByb3BzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoa1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdWx0W2tdID0gcHJvcHNba107XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfcmVzdF9wcm9wcyhwcm9wcywga2V5cykge1xuICAgIGNvbnN0IHJlc3QgPSB7fTtcbiAgICBrZXlzID0gbmV3IFNldChrZXlzKTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcHJvcHMpXG4gICAgICAgIGlmICgha2V5cy5oYXMoaykgJiYga1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN0O1xufVxuZnVuY3Rpb24gY29tcHV0ZV9zbG90cyhzbG90cykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHNsb3RzKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICBsZXQgcmFuID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGlmIChyYW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgIGZuLmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIG51bGxfdG9fZW1wdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG59XG5mdW5jdGlvbiBzZXRfc3RvcmVfdmFsdWUoc3RvcmUsIHJldCwgdmFsdWUgPSByZXQpIHtcbiAgICBzdG9yZS5zZXQodmFsdWUpO1xuICAgIHJldHVybiByZXQ7XG59XG5jb25zdCBoYXNfcHJvcCA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xuZnVuY3Rpb24gYWN0aW9uX2Rlc3Ryb3llcihhY3Rpb25fcmVzdWx0KSB7XG4gICAgcmV0dXJuIGFjdGlvbl9yZXN1bHQgJiYgaXNfZnVuY3Rpb24oYWN0aW9uX3Jlc3VsdC5kZXN0cm95KSA/IGFjdGlvbl9yZXN1bHQuZGVzdHJveSA6IG5vb3A7XG59XG5cbmNvbnN0IGlzX2NsaWVudCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xubGV0IG5vdyA9IGlzX2NsaWVudFxuICAgID8gKCkgPT4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgOiAoKSA9PiBEYXRlLm5vdygpO1xubGV0IHJhZiA9IGlzX2NsaWVudCA/IGNiID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShjYikgOiBub29wO1xuLy8gdXNlZCBpbnRlcm5hbGx5IGZvciB0ZXN0aW5nXG5mdW5jdGlvbiBzZXRfbm93KGZuKSB7XG4gICAgbm93ID0gZm47XG59XG5mdW5jdGlvbiBzZXRfcmFmKGZuKSB7XG4gICAgcmFmID0gZm47XG59XG5cbmNvbnN0IHRhc2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gcnVuX3Rhc2tzKG5vdykge1xuICAgIHRhc2tzLmZvckVhY2godGFzayA9PiB7XG4gICAgICAgIGlmICghdGFzay5jKG5vdykpIHtcbiAgICAgICAgICAgIHRhc2tzLmRlbGV0ZSh0YXNrKTtcbiAgICAgICAgICAgIHRhc2suZigpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHRhc2tzLnNpemUgIT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xufVxuLyoqXG4gKiBGb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5IVxuICovXG5mdW5jdGlvbiBjbGVhcl9sb29wcygpIHtcbiAgICB0YXNrcy5jbGVhcigpO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHRhc2sgdGhhdCBydW5zIG9uIGVhY2ggcmFmIGZyYW1lXG4gKiB1bnRpbCBpdCByZXR1cm5zIGEgZmFsc3kgdmFsdWUgb3IgaXMgYWJvcnRlZFxuICovXG5mdW5jdGlvbiBsb29wKGNhbGxiYWNrKSB7XG4gICAgbGV0IHRhc2s7XG4gICAgaWYgKHRhc2tzLnNpemUgPT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IG5ldyBQcm9taXNlKGZ1bGZpbGwgPT4ge1xuICAgICAgICAgICAgdGFza3MuYWRkKHRhc2sgPSB7IGM6IGNhbGxiYWNrLCBmOiBmdWxmaWxsIH0pO1xuICAgICAgICB9KSxcbiAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG59XG5mdW5jdGlvbiBkZXRhY2gobm9kZSkge1xuICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfZWFjaChpdGVyYXRpb25zLCBkZXRhY2hpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnNbaV0pXG4gICAgICAgICAgICBpdGVyYXRpb25zW2ldLmQoZGV0YWNoaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBlbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRfaXMobmFtZSwgaXMpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lLCB7IGlzIH0pO1xufVxuZnVuY3Rpb24gb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcyhvYmosIGV4Y2x1ZGUpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXNfcHJvcChvYmosIGspXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAmJiBleGNsdWRlLmluZGV4T2YoaykgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICB0YXJnZXRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIHN2Z19lbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5hbWUpO1xufVxuZnVuY3Rpb24gdGV4dChkYXRhKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xufVxuZnVuY3Rpb24gc3BhY2UoKSB7XG4gICAgcmV0dXJuIHRleHQoJyAnKTtcbn1cbmZ1bmN0aW9uIGVtcHR5KCkge1xuICAgIHJldHVybiB0ZXh0KCcnKTtcbn1cbmZ1bmN0aW9uIGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG59XG5mdW5jdGlvbiBwcmV2ZW50X2RlZmF1bHQoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzdG9wX3Byb3BhZ2F0aW9uKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNlbGYoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcylcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICBlbHNlIGlmIChub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSlcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBzZXRfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobm9kZS5fX3Byb3RvX18pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5jc3NUZXh0ID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ19fdmFsdWUnKSB7XG4gICAgICAgICAgICBub2RlLnZhbHVlID0gbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlc2NyaXB0b3JzW2tleV0gJiYgZGVzY3JpcHRvcnNba2V5XS5zZXQpIHtcbiAgICAgICAgICAgIG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3N2Z19hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhKG5vZGUsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgaW4gbm9kZSkge1xuICAgICAgICBub2RlW3Byb3BdID0gdHlwZW9mIG5vZGVbcHJvcF0gPT09ICdib29sZWFuJyAmJiB2YWx1ZSA9PT0gJycgPyB0cnVlIDogdmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhdHRyKG5vZGUsIHByb3AsIHZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiB4bGlua19hdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBnZXRfYmluZGluZ19ncm91cF92YWx1ZShncm91cCwgX192YWx1ZSwgY2hlY2tlZCkge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFNldCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGdyb3VwW2ldLmNoZWNrZWQpXG4gICAgICAgICAgICB2YWx1ZS5hZGQoZ3JvdXBbaV0uX192YWx1ZSk7XG4gICAgfVxuICAgIGlmICghY2hlY2tlZCkge1xuICAgICAgICB2YWx1ZS5kZWxldGUoX192YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHRvX251bWJlcih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gJycgPyBudWxsIDogK3ZhbHVlO1xufVxuZnVuY3Rpb24gdGltZV9yYW5nZXNfdG9fYXJyYXkocmFuZ2VzKSB7XG4gICAgY29uc3QgYXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhcnJheS5wdXNoKHsgc3RhcnQ6IHJhbmdlcy5zdGFydChpKSwgZW5kOiByYW5nZXMuZW5kKGkpIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG5mdW5jdGlvbiBjaGlsZHJlbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jaGlsZE5vZGVzKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIHN2Zykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgbGV0IGogPSAwO1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlID0gW107XG4gICAgICAgICAgICB3aGlsZSAoaiA8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBub2RlLmF0dHJpYnV0ZXNbaisrXTtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZS5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHJlbW92ZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKHJlbW92ZVtrXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdmcgPyBzdmdfZWxlbWVudChuYW1lKSA6IGVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBjbGFpbV90ZXh0KG5vZGVzLCBkYXRhKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSAnJyArIGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0ZXh0KGRhdGEpO1xufVxuZnVuY3Rpb24gY2xhaW1fc3BhY2Uobm9kZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fdGV4dChub2RlcywgJyAnKTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhKHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCAhPT0gZGF0YSlcbiAgICAgICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X2lucHV0X3R5cGUoaW5wdXQsIHR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBpbnB1dC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdHlsZShub2RlLCBrZXksIHZhbHVlLCBpbXBvcnRhbnQpIHtcbiAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCA/ICdpbXBvcnRhbnQnIDogJycpO1xufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbihzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wdGlvbi5fX3ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb25zKHNlbGVjdCwgdmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdC5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW2ldO1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB+dmFsdWUuaW5kZXhPZihvcHRpb24uX192YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X3ZhbHVlKHNlbGVjdCkge1xuICAgIGNvbnN0IHNlbGVjdGVkX29wdGlvbiA9IHNlbGVjdC5xdWVyeVNlbGVjdG9yKCc6Y2hlY2tlZCcpIHx8IHNlbGVjdC5vcHRpb25zWzBdO1xuICAgIHJldHVybiBzZWxlY3RlZF9vcHRpb24gJiYgc2VsZWN0ZWRfb3B0aW9uLl9fdmFsdWU7XG59XG5mdW5jdGlvbiBzZWxlY3RfbXVsdGlwbGVfdmFsdWUoc2VsZWN0KSB7XG4gICAgcmV0dXJuIFtdLm1hcC5jYWxsKHNlbGVjdC5xdWVyeVNlbGVjdG9yQWxsKCc6Y2hlY2tlZCcpLCBvcHRpb24gPT4gb3B0aW9uLl9fdmFsdWUpO1xufVxuLy8gdW5mb3J0dW5hdGVseSB0aGlzIGNhbid0IGJlIGEgY29uc3RhbnQgYXMgdGhhdCB3b3VsZG4ndCBiZSB0cmVlLXNoYWtlYWJsZVxuLy8gc28gd2UgY2FjaGUgdGhlIHJlc3VsdCBpbnN0ZWFkXG5sZXQgY3Jvc3NvcmlnaW47XG5mdW5jdGlvbiBpc19jcm9zc29yaWdpbigpIHtcbiAgICBpZiAoY3Jvc3NvcmlnaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjcm9zc29yaWdpbiA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB2b2lkIHdpbmRvdy5wYXJlbnQuZG9jdW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjcm9zc29yaWdpbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyb3Nzb3JpZ2luO1xufVxuZnVuY3Rpb24gYWRkX3Jlc2l6ZV9saXN0ZW5lcihub2RlLCBmbikge1xuICAgIGNvbnN0IGNvbXB1dGVkX3N0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICAnb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTE7Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmcmFtZS50YWJJbmRleCA9IC0xO1xuICAgIGNvbnN0IGNyb3Nzb3JpZ2luID0gaXNfY3Jvc3NvcmlnaW4oKTtcbiAgICBsZXQgdW5zdWJzY3JpYmU7XG4gICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSBcImRhdGE6dGV4dC9odG1sLDxzY3JpcHQ+b25yZXNpemU9ZnVuY3Rpb24oKXtwYXJlbnQucG9zdE1lc3NhZ2UoMCwnKicpfTwvc2NyaXB0PlwiO1xuICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3Rlbih3aW5kb3csICdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBpZnJhbWUuY29udGVudFdpbmRvdylcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICBpZnJhbWUub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4oaWZyYW1lLmNvbnRlbnRXaW5kb3csICdyZXNpemUnLCBmbik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFwcGVuZChub2RlLCBpZnJhbWUpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1bnN1YnNjcmliZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXRhY2goaWZyYW1lKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdG9nZ2xlX2NsYXNzKGVsZW1lbnQsIG5hbWUsIHRvZ2dsZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0W3RvZ2dsZSA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xufVxuZnVuY3Rpb24gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCkge1xuICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIGRldGFpbCk7XG4gICAgcmV0dXJuIGU7XG59XG5mdW5jdGlvbiBxdWVyeV9zZWxlY3Rvcl9hbGwoc2VsZWN0b3IsIHBhcmVudCA9IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufVxuY2xhc3MgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoYW5jaG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLmEgPSBhbmNob3I7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgfVxuICAgIG0oaHRtbCwgdGFyZ2V0LCBhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5lKSB7XG4gICAgICAgICAgICB0aGlzLmUgPSBlbGVtZW50KHRhcmdldC5ub2RlTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnQgPSB0YXJnZXQ7XG4gICAgICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pKGFuY2hvcik7XG4gICAgfVxuICAgIGgoaHRtbCkge1xuICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgdGhpcy5uID0gQXJyYXkuZnJvbSh0aGlzLmUuY2hpbGROb2Rlcyk7XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnQodGhpcy50LCB0aGlzLm5baV0sIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcChodG1sKSB7XG4gICAgICAgIHRoaXMuZCgpO1xuICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgICAgIHRoaXMuaSh0aGlzLmEpO1xuICAgIH1cbiAgICBkKCkge1xuICAgICAgICB0aGlzLm4uZm9yRWFjaChkZXRhY2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGF0dHJpYnV0ZV90b19vYmplY3QoYXR0cmlidXRlcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgcmVzdWx0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGdldF9jdXN0b21fZWxlbWVudHNfc2xvdHMoZWxlbWVudCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIHJlc3VsdFtub2RlLnNsb3QgfHwgJ2RlZmF1bHQnXSA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgYWN0aXZlX2RvY3MgPSBuZXcgU2V0KCk7XG5sZXQgYWN0aXZlID0gMDtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXJrc2t5YXBwL3N0cmluZy1oYXNoL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5mdW5jdGlvbiBoYXNoKHN0cikge1xuICAgIGxldCBoYXNoID0gNTM4MTtcbiAgICBsZXQgaSA9IHN0ci5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSlcbiAgICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpIF4gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGhhc2ggPj4+IDA7XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGNvbnN0IGRvYyA9IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBhY3RpdmVfZG9jcy5hZGQoZG9jKTtcbiAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQgfHwgKGRvYy5fX3N2ZWx0ZV9zdHlsZXNoZWV0ID0gZG9jLmhlYWQuYXBwZW5kQ2hpbGQoZWxlbWVudCgnc3R5bGUnKSkuc2hlZXQpO1xuICAgIGNvbnN0IGN1cnJlbnRfcnVsZXMgPSBkb2MuX19zdmVsdGVfcnVsZXMgfHwgKGRvYy5fX3N2ZWx0ZV9ydWxlcyA9IHt9KTtcbiAgICBpZiAoIWN1cnJlbnRfcnVsZXNbbmFtZV0pIHtcbiAgICAgICAgY3VycmVudF9ydWxlc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIHN0eWxlc2hlZXQuaW5zZXJ0UnVsZShgQGtleWZyYW1lcyAke25hbWV9ICR7cnVsZX1gLCBzdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgfVxuICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5vZGUuc3R5bGUuYW5pbWF0aW9uIHx8ICcnO1xuICAgIG5vZGUuc3R5bGUuYW5pbWF0aW9uID0gYCR7YW5pbWF0aW9uID8gYCR7YW5pbWF0aW9ufSwgYCA6ICcnfSR7bmFtZX0gJHtkdXJhdGlvbn1tcyBsaW5lYXIgJHtkZWxheX1tcyAxIGJvdGhgO1xuICAgIGFjdGl2ZSArPSAxO1xuICAgIHJldHVybiBuYW1lO1xufVxuZnVuY3Rpb24gZGVsZXRlX3J1bGUobm9kZSwgbmFtZSkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gKG5vZGUuc3R5bGUuYW5pbWF0aW9uIHx8ICcnKS5zcGxpdCgnLCAnKTtcbiAgICBjb25zdCBuZXh0ID0gcHJldmlvdXMuZmlsdGVyKG5hbWVcbiAgICAgICAgPyBhbmltID0+IGFuaW0uaW5kZXhPZihuYW1lKSA8IDAgLy8gcmVtb3ZlIHNwZWNpZmljIGFuaW1hdGlvblxuICAgICAgICA6IGFuaW0gPT4gYW5pbS5pbmRleE9mKCdfX3N2ZWx0ZScpID09PSAtMSAvLyByZW1vdmUgYWxsIFN2ZWx0ZSBhbmltYXRpb25zXG4gICAgKTtcbiAgICBjb25zdCBkZWxldGVkID0gcHJldmlvdXMubGVuZ3RoIC0gbmV4dC5sZW5ndGg7XG4gICAgaWYgKGRlbGV0ZWQpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBuZXh0LmpvaW4oJywgJyk7XG4gICAgICAgIGFjdGl2ZSAtPSBkZWxldGVkO1xuICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgIGNsZWFyX3J1bGVzKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gY2xlYXJfcnVsZXMoKSB7XG4gICAgcmFmKCgpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYWN0aXZlX2RvY3MuZm9yRWFjaChkb2MgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGVzaGVldCA9IGRvYy5fX3N2ZWx0ZV9zdHlsZXNoZWV0O1xuICAgICAgICAgICAgbGV0IGkgPSBzdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pXG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldC5kZWxldGVSdWxlKGkpO1xuICAgICAgICAgICAgZG9jLl9fc3ZlbHRlX3J1bGVzID0ge307XG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmVfZG9jcy5jbGVhcigpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVfYW5pbWF0aW9uKG5vZGUsIGZyb20sIGZuLCBwYXJhbXMpIHtcbiAgICBpZiAoIWZyb20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHRvID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoZnJvbS5sZWZ0ID09PSB0by5sZWZ0ICYmIGZyb20ucmlnaHQgPT09IHRvLnJpZ2h0ICYmIGZyb20udG9wID09PSB0by50b3AgJiYgZnJvbS5ib3R0b20gPT09IHRvLmJvdHRvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBzaG91bGQgdGhpcyBiZSBzZXBhcmF0ZWQgZnJvbSBkZXN0cnVjdHVyaW5nPyBPciBzdGFydC9lbmQgYWRkZWQgdG8gcHVibGljIGFwaSBhbmQgZG9jdW1lbnRhdGlvbj9cbiAgICBzdGFydDogc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzpcbiAgICBlbmQgPSBzdGFydF90aW1lICsgZHVyYXRpb24sIHRpY2sgPSBub29wLCBjc3MgfSA9IGZuKG5vZGUsIHsgZnJvbSwgdG8gfSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBsZXQgbmFtZTtcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDAsIDEsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGVsYXkpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBuYW1lKTtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgIGlmICghc3RhcnRlZCAmJiBub3cgPj0gc3RhcnRfdGltZSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQgJiYgbm93ID49IGVuZCkge1xuICAgICAgICAgICAgdGljaygxLCAwKTtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCkge1xuICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHN0YXJ0X3RpbWU7XG4gICAgICAgICAgICBjb25zdCB0ID0gMCArIDEgKiBlYXNpbmcocCAvIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHN0YXJ0KCk7XG4gICAgdGljaygwLCAxKTtcbiAgICByZXR1cm4gc3RvcDtcbn1cbmZ1bmN0aW9uIGZpeF9wb3NpdGlvbihub2RlKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChzdHlsZS5wb3NpdGlvbiAhPT0gJ2Fic29sdXRlJyAmJiBzdHlsZS5wb3NpdGlvbiAhPT0gJ2ZpeGVkJykge1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHN0eWxlO1xuICAgICAgICBjb25zdCBhID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIG5vZGUuc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgbm9kZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGFkZF90cmFuc2Zvcm0obm9kZSwgYSk7XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkX3RyYW5zZm9ybShub2RlLCBhKSB7XG4gICAgY29uc3QgYiA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGEubGVmdCAhPT0gYi5sZWZ0IHx8IGEudG9wICE9PSBiLnRvcCkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIG5vZGUuc3R5bGUudHJhbnNmb3JtID0gYCR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHthLmxlZnQgLSBiLmxlZnR9cHgsICR7YS50b3AgLSBiLnRvcH1weClgO1xuICAgIH1cbn1cblxubGV0IGN1cnJlbnRfY29tcG9uZW50O1xuZnVuY3Rpb24gc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgIGN1cnJlbnRfY29tcG9uZW50ID0gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkge1xuICAgIGlmICghY3VycmVudF9jb21wb25lbnQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRnVuY3Rpb24gY2FsbGVkIG91dHNpZGUgY29tcG9uZW50IGluaXRpYWxpemF0aW9uJyk7XG4gICAgcmV0dXJuIGN1cnJlbnRfY29tcG9uZW50O1xufVxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlKGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYmVmb3JlX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIG9uTW91bnQoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9tb3VudC5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFmdGVyVXBkYXRlKGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYWZ0ZXJfdXBkYXRlLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gb25EZXN0cm95KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fZGVzdHJveS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpIHtcbiAgICBjb25zdCBjb21wb25lbnQgPSBnZXRfY3VycmVudF9jb21wb25lbnQoKTtcbiAgICByZXR1cm4gKHR5cGUsIGRldGFpbCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBjb21wb25lbnQuJCQuY2FsbGJhY2tzW3R5cGVdO1xuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGFyZSB0aGVyZSBzaXR1YXRpb25zIHdoZXJlIGV2ZW50cyBjb3VsZCBiZSBkaXNwYXRjaGVkXG4gICAgICAgICAgICAvLyBpbiBhIHNlcnZlciAobm9uLURPTSkgZW52aXJvbm1lbnQ/XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwpO1xuICAgICAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChjb21wb25lbnQsIGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5zZXQoa2V5LCBjb250ZXh0KTtcbn1cbmZ1bmN0aW9uIGdldENvbnRleHQoa2V5KSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuZ2V0KGtleSk7XG59XG5mdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmhhcyhrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4oZXZlbnQpKTtcbiAgICB9XG59XG5cbmNvbnN0IGRpcnR5X2NvbXBvbmVudHMgPSBbXTtcbmNvbnN0IGludHJvcyA9IHsgZW5hYmxlZDogZmFsc2UgfTtcbmNvbnN0IGJpbmRpbmdfY2FsbGJhY2tzID0gW107XG5jb25zdCByZW5kZXJfY2FsbGJhY2tzID0gW107XG5jb25zdCBmbHVzaF9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlc29sdmVkX3Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbmxldCB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG5mdW5jdGlvbiBzY2hlZHVsZV91cGRhdGUoKSB7XG4gICAgaWYgKCF1cGRhdGVfc2NoZWR1bGVkKSB7XG4gICAgICAgIHVwZGF0ZV9zY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlZF9wcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRpY2soKSB7XG4gICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkX3Byb21pc2U7XG59XG5mdW5jdGlvbiBhZGRfcmVuZGVyX2NhbGxiYWNrKGZuKSB7XG4gICAgcmVuZGVyX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFkZF9mbHVzaF9jYWxsYmFjayhmbikge1xuICAgIGZsdXNoX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmxldCBmbHVzaGluZyA9IGZhbHNlO1xuY29uc3Qgc2Vlbl9jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICBpZiAoZmx1c2hpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgZG8ge1xuICAgICAgICAvLyBmaXJzdCwgY2FsbCBiZWZvcmVVcGRhdGUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbaV07XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShjb21wb25lbnQuJCQpO1xuICAgICAgICB9XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5sZW5ndGggPSAwO1xuICAgICAgICB3aGlsZSAoYmluZGluZ19jYWxsYmFja3MubGVuZ3RoKVxuICAgICAgICAgICAgYmluZGluZ19jYWxsYmFja3MucG9wKCkoKTtcbiAgICAgICAgLy8gdGhlbiwgb25jZSBjb21wb25lbnRzIGFyZSB1cGRhdGVkLCBjYWxsXG4gICAgICAgIC8vIGFmdGVyVXBkYXRlIGZ1bmN0aW9ucy4gVGhpcyBtYXkgY2F1c2VcbiAgICAgICAgLy8gc3Vic2VxdWVudCB1cGRhdGVzLi4uXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSByZW5kZXJfY2FsbGJhY2tzW2ldO1xuICAgICAgICAgICAgaWYgKCFzZWVuX2NhbGxiYWNrcy5oYXMoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgLy8gLi4uc28gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBsb29wc1xuICAgICAgICAgICAgICAgIHNlZW5fY2FsbGJhY2tzLmFkZChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW5kZXJfY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gICAgfSB3aGlsZSAoZGlydHlfY29tcG9uZW50cy5sZW5ndGgpO1xuICAgIHdoaWxlIChmbHVzaF9jYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgIGZsdXNoX2NhbGxiYWNrcy5wb3AoKSgpO1xuICAgIH1cbiAgICB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG4gICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICBzZWVuX2NhbGxiYWNrcy5jbGVhcigpO1xufVxuZnVuY3Rpb24gdXBkYXRlKCQkKSB7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICQkLnVwZGF0ZSgpO1xuICAgICAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgICAgICBjb25zdCBkaXJ0eSA9ICQkLmRpcnR5O1xuICAgICAgICAkJC5kaXJ0eSA9IFstMV07XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LnAoJCQuY3R4LCBkaXJ0eSk7XG4gICAgICAgICQkLmFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xuICAgIH1cbn1cblxubGV0IHByb21pc2U7XG5mdW5jdGlvbiB3YWl0KCkge1xuICAgIGlmICghcHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gZGlzcGF0Y2gobm9kZSwgZGlyZWN0aW9uLCBraW5kKSB7XG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudChgJHtkaXJlY3Rpb24gPyAnaW50cm8nIDogJ291dHJvJ30ke2tpbmR9YCkpO1xufVxuY29uc3Qgb3V0cm9pbmcgPSBuZXcgU2V0KCk7XG5sZXQgb3V0cm9zO1xuZnVuY3Rpb24gZ3JvdXBfb3V0cm9zKCkge1xuICAgIG91dHJvcyA9IHtcbiAgICAgICAgcjogMCxcbiAgICAgICAgYzogW10sXG4gICAgICAgIHA6IG91dHJvcyAvLyBwYXJlbnQgZ3JvdXBcbiAgICB9O1xufVxuZnVuY3Rpb24gY2hlY2tfb3V0cm9zKCkge1xuICAgIGlmICghb3V0cm9zLnIpIHtcbiAgICAgICAgcnVuX2FsbChvdXRyb3MuYyk7XG4gICAgfVxuICAgIG91dHJvcyA9IG91dHJvcy5wO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9pbihibG9jaywgbG9jYWwpIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2suaSkge1xuICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICBibG9jay5pKGxvY2FsKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX291dChibG9jaywgbG9jYWwsIGRldGFjaCwgY2FsbGJhY2spIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2subykge1xuICAgICAgICBpZiAob3V0cm9pbmcuaGFzKGJsb2NrKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb3V0cm9pbmcuYWRkKGJsb2NrKTtcbiAgICAgICAgb3V0cm9zLmMucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRldGFjaClcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suZCgxKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYmxvY2subyhsb2NhbCk7XG4gICAgfVxufVxuY29uc3QgbnVsbF90cmFuc2l0aW9uID0geyBkdXJhdGlvbjogMCB9O1xuZnVuY3Rpb24gY3JlYXRlX2luX3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGxldCB0YXNrO1xuICAgIGxldCB1aWQgPSAwO1xuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDAsIDEsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MsIHVpZCsrKTtcbiAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXk7XG4gICAgICAgIGNvbnN0IGVuZF90aW1lID0gc3RhcnRfdGltZSArIGR1cmF0aW9uO1xuICAgICAgICBpZiAodGFzaylcbiAgICAgICAgICAgIHRhc2suYWJvcnQoKTtcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ3N0YXJ0JykpO1xuICAgICAgICB0YXNrID0gbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHRydWUsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCgpIHtcbiAgICAgICAgICAgIGlmIChzdGFydGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbihnbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX291dF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGNvbnN0IGdyb3VwID0gb3V0cm9zO1xuICAgIGdyb3VwLnIgKz0gMTtcbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMSwgMCwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWdyb3VwLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwoZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSAtIHQsIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICBnbygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdvKCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGVuZChyZXNldCkge1xuICAgICAgICAgICAgaWYgKHJlc2V0ICYmIGNvbmZpZy50aWNrKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnRpY2soMSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMsIGludHJvKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHQgPSBpbnRybyA/IDAgOiAxO1xuICAgIGxldCBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gY2xlYXJfYW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluaXQocHJvZ3JhbSwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgZCA9IHByb2dyYW0uYiAtIHQ7XG4gICAgICAgIGR1cmF0aW9uICo9IE1hdGguYWJzKGQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYTogdCxcbiAgICAgICAgICAgIGI6IHByb2dyYW0uYixcbiAgICAgICAgICAgIGQsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXJ0OiBwcm9ncmFtLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBwcm9ncmFtLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICBncm91cDogcHJvZ3JhbS5ncm91cFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbyhiKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICBzdGFydDogbm93KCkgKyBkZWxheSxcbiAgICAgICAgICAgIGJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgcHJvZ3JhbS5ncm91cCA9IG91dHJvcztcbiAgICAgICAgICAgIG91dHJvcy5yICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5ibG9ja3NbaV0gPT09IGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgICAgIGlmICghaW5mby5oYXNDYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaWYgd2UgcHJldmlvdXNseSBoYWQgYSB0aGVuL2NhdGNoIGJsb2NrLCBkZXN0cm95IGl0XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8ucGVuZGluZykge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8ucGVuZGluZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby50aGVuKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSBwcm9taXNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2goaW5mbywgY3R4LCBkaXJ0eSkge1xuICAgIGNvbnN0IGNoaWxkX2N0eCA9IGN0eC5zbGljZSgpO1xuICAgIGNvbnN0IHsgcmVzb2x2ZWQgfSA9IGluZm87XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby50aGVuKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLnZhbHVlXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLmNhdGNoKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLmVycm9yXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpbmZvLmJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl0pO1xuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBjbGFzc2VzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke1N0cmluZyh2YWx1ZSkucmVwbGFjZSgvXCIvZywgJyYjMzQ7JykucmVwbGFjZSgvJy9nLCAnJiMzOTsnKX1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgZXNjYXBlZCA9IHtcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0Oydcbn07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICAgIHJldHVybiBTdHJpbmcoaHRtbCkucmVwbGFjZSgvW1wiJyY8Pl0vZywgbWF0Y2ggPT4gZXNjYXBlZFttYXRjaF0pO1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlc2ApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cywgY29udGV4dCkge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IGNvbnRleHQgfHwgW10pLFxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBpbW1lZGlhdGVseSBkaXNjYXJkZWRcbiAgICAgICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KClcbiAgICAgICAgfTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHsgJCQgfSk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBmbihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMpO1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXI6IChwcm9wcyA9IHt9LCB7ICQkc2xvdHMgPSB7fSwgY29udGV4dCA9IG5ldyBNYXAoKSB9ID0ge30pID0+IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgdGl0bGU6ICcnLCBoZWFkOiAnJywgY3NzOiBuZXcgU2V0KCkgfTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCB7fSwgJCRzbG90cywgY29udGV4dCk7XG4gICAgICAgICAgICBydW5fYWxsKG9uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBBcnJheS5mcm9tKHJlc3VsdC5jc3MpLm1hcChjc3MgPT4gY3NzLmNvZGUpLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IG51bGwgLy8gVE9ET1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZDogcmVzdWx0LnRpdGxlICsgcmVzdWx0LmhlYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICQkcmVuZGVyXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZF9hdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAoYm9vbGVhbiAmJiAhdmFsdWUpKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGAgJHtuYW1lfSR7dmFsdWUgPT09IHRydWUgPyAnJyA6IGA9JHt0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5zdHJpbmdpZnkoZXNjYXBlKHZhbHVlKSkgOiBgXCIke3ZhbHVlfVwiYH1gfWA7XG59XG5mdW5jdGlvbiBhZGRfY2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMgPyBgIGNsYXNzPVwiJHtjbGFzc2VzfVwiYCA6ICcnO1xufVxuXG5mdW5jdGlvbiBiaW5kKGNvbXBvbmVudCwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBpbmRleCA9IGNvbXBvbmVudC4kJC5wcm9wc1tuYW1lXTtcbiAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb21wb25lbnQuJCQuYm91bmRbaW5kZXhdID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudC4kJC5jdHhbaW5kZXhdKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVfY29tcG9uZW50KGJsb2NrKSB7XG4gICAgYmxvY2sgJiYgYmxvY2suYygpO1xufVxuZnVuY3Rpb24gY2xhaW1fY29tcG9uZW50KGJsb2NrLCBwYXJlbnRfbm9kZXMpIHtcbiAgICBibG9jayAmJiBibG9jay5sKHBhcmVudF9ub2Rlcyk7XG59XG5mdW5jdGlvbiBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCB0YXJnZXQsIGFuY2hvciwgY3VzdG9tRWxlbWVudCkge1xuICAgIGNvbnN0IHsgZnJhZ21lbnQsIG9uX21vdW50LCBvbl9kZXN0cm95LCBhZnRlcl91cGRhdGUgfSA9IGNvbXBvbmVudC4kJDtcbiAgICBmcmFnbWVudCAmJiBmcmFnbWVudC5tKHRhcmdldCwgYW5jaG9yKTtcbiAgICBpZiAoIWN1c3RvbUVsZW1lbnQpIHtcbiAgICAgICAgLy8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld19vbl9kZXN0cm95ID0gb25fbW91bnQubWFwKHJ1bikuZmlsdGVyKGlzX2Z1bmN0aW9uKTtcbiAgICAgICAgICAgIGlmIChvbl9kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgb25fZGVzdHJveS5wdXNoKC4uLm5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEVkZ2UgY2FzZSAtIGNvbXBvbmVudCB3YXMgZGVzdHJveWVkIGltbWVkaWF0ZWx5LFxuICAgICAgICAgICAgICAgIC8vIG1vc3QgbGlrZWx5IGFzIGEgcmVzdWx0IG9mIGEgYmluZGluZyBpbml0aWFsaXNpbmdcbiAgICAgICAgICAgICAgICBydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC4kJC5vbl9tb3VudCA9IFtdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2NvbXBvbmVudChjb21wb25lbnQsIGRldGFjaGluZykge1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkO1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBydW5fYWxsKCQkLm9uX2Rlc3Ryb3kpO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5kKGRldGFjaGluZyk7XG4gICAgICAgIC8vIFRPRE8gbnVsbCBvdXQgb3RoZXIgcmVmcywgaW5jbHVkaW5nIGNvbXBvbmVudC4kJCAoYnV0IG5lZWQgdG9cbiAgICAgICAgLy8gcHJlc2VydmUgZmluYWwgc3RhdGU/KVxuICAgICAgICAkJC5vbl9kZXN0cm95ID0gJCQuZnJhZ21lbnQgPSBudWxsO1xuICAgICAgICAkJC5jdHggPSBbXTtcbiAgICB9XG59XG5mdW5jdGlvbiBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSkge1xuICAgIGlmIChjb21wb25lbnQuJCQuZGlydHlbMF0gPT09IC0xKSB7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICBzY2hlZHVsZV91cGRhdGUoKTtcbiAgICAgICAgY29tcG9uZW50LiQkLmRpcnR5LmZpbGwoMCk7XG4gICAgfVxuICAgIGNvbXBvbmVudC4kJC5kaXJ0eVsoaSAvIDMxKSB8IDBdIHw9ICgxIDw8IChpICUgMzEpKTtcbn1cbmZ1bmN0aW9uIGluaXQoY29tcG9uZW50LCBvcHRpb25zLCBpbnN0YW5jZSwgY3JlYXRlX2ZyYWdtZW50LCBub3RfZXF1YWwsIHByb3BzLCBkaXJ0eSA9IFstMV0pIHtcbiAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQgPSB7XG4gICAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgICBjdHg6IG51bGwsXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgb25fZGlzY29ubmVjdDogW10sXG4gICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICBjb250ZXh0OiBuZXcgTWFwKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBvcHRpb25zLmNvbnRleHQgfHwgW10pLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlXG4gICAgfTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY2hpbGRyZW4ob3B0aW9ucy50YXJnZXQpO1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50Lmwobm9kZXMpO1xuICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChkZXRhY2gpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5pbnRybylcbiAgICAgICAgICAgIHRyYW5zaXRpb25faW4oY29tcG9uZW50LiQkLmZyYWdtZW50KTtcbiAgICAgICAgbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgb3B0aW9ucy50YXJnZXQsIG9wdGlvbnMuYW5jaG9yLCBvcHRpb25zLmN1c3RvbUVsZW1lbnQpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgY29uc3QgeyBvbl9tb3VudCB9ID0gdGhpcy4kJDtcbiAgICAgICAgICAgIHRoaXMuJCQub25fZGlzY29ubmVjdCA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJC5zbG90dGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuJCQuc2xvdHRlZFtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgX29sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpc1thdHRyXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QpO1xuICAgICAgICB9XG4gICAgICAgICRkZXN0cm95KCkge1xuICAgICAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRPRE8gc2hvdWxkIHRoaXMgZGVsZWdhdGUgdG8gYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgJHNldCgkJHByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuJCRzZXQoJCRwcm9wcyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cy4gVXNlZCB3aGVuIGRldj1mYWxzZS5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50IHtcbiAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgIHRoaXMuJGRlc3Ryb3kgPSBub29wO1xuICAgIH1cbiAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSA9IFtdKSk7XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJHNldCgkJHByb3BzKSB7XG4gICAgICAgIGlmICh0aGlzLiQkc2V0ICYmICFpc19lbXB0eSgkJHByb3BzKSkge1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuJCRzZXQoJCRwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hfZGV2KHR5cGUsIGRldGFpbCkge1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KHR5cGUsIE9iamVjdC5hc3NpZ24oeyB2ZXJzaW9uOiAnMy4zOC4yJyB9LCBkZXRhaWwpKSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfZGV2KHRhcmdldCwgbm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUgfSk7XG4gICAgYXBwZW5kKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBkZXRhY2hfZGV2KG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZScsIHsgbm9kZSB9KTtcbiAgICBkZXRhY2gobm9kZSk7XG59XG5mdW5jdGlvbiBkZXRhY2hfYmV0d2Vlbl9kZXYoYmVmb3JlLCBhZnRlcikge1xuICAgIHdoaWxlIChiZWZvcmUubmV4dFNpYmxpbmcgJiYgYmVmb3JlLm5leHRTaWJsaW5nICE9PSBhZnRlcikge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2JlZm9yZV9kZXYoYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYWZ0ZXIucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYWZ0ZXIucHJldmlvdXNTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYWZ0ZXJfZGV2KGJlZm9yZSkge1xuICAgIHdoaWxlIChiZWZvcmUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxpc3Rlbl9kZXYobm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMsIGhhc19wcmV2ZW50X2RlZmF1bHQsIGhhc19zdG9wX3Byb3BhZ2F0aW9uKSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gb3B0aW9ucyA9PT0gdHJ1ZSA/IFsnY2FwdHVyZSddIDogb3B0aW9ucyA/IEFycmF5LmZyb20oT2JqZWN0LmtleXMob3B0aW9ucykpIDogW107XG4gICAgaWYgKGhhc19wcmV2ZW50X2RlZmF1bHQpXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdwcmV2ZW50RGVmYXVsdCcpO1xuICAgIGlmIChoYXNfc3RvcF9wcm9wYWdhdGlvbilcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3N0b3BQcm9wYWdhdGlvbicpO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NQWRkRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICBjb25zdCBkaXNwb3NlID0gbGlzdGVuKG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gYXR0cl9kZXYobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlQXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUgfSk7XG4gICAgZWxzZVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldEF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlLCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHByb3BfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGVbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRQcm9wZXJ0eScsIHsgbm9kZSwgcHJvcGVydHksIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gZGF0YXNldF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZS5kYXRhc2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YXNldCcsIHsgbm9kZSwgcHJvcGVydHksIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfZGV2KHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YScsIHsgbm9kZTogdGV4dCwgZGF0YSB9KTtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfZWFjaF9hcmd1bWVudChhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgJiYgIShhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgJ2xlbmd0aCcgaW4gYXJnKSkge1xuICAgICAgICBsZXQgbXNnID0gJ3sjZWFjaH0gb25seSBpdGVyYXRlcyBvdmVyIGFycmF5LWxpa2Ugb2JqZWN0cy4nO1xuICAgICAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBhcmcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGFyZykge1xuICAgICAgICAgICAgbXNnICs9ICcgWW91IGNhbiB1c2UgYSBzcHJlYWQgdG8gY29udmVydCB0aGlzIGl0ZXJhYmxlIGludG8gYW4gYXJyYXkuJztcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zbG90cyhuYW1lLCBzbG90LCBrZXlzKSB7XG4gICAgZm9yIChjb25zdCBzbG90X2tleSBvZiBPYmplY3Qua2V5cyhzbG90KSkge1xuICAgICAgICBpZiAoIX5rZXlzLmluZGV4T2Yoc2xvdF9rZXkpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYDwke25hbWV9PiByZWNlaXZlZCBhbiB1bmV4cGVjdGVkIHNsb3QgXCIke3Nsb3Rfa2V5fVwiLmApO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cyB3aXRoIHNvbWUgbWlub3IgZGV2LWVuaGFuY2VtZW50cy4gVXNlZCB3aGVuIGRldj10cnVlLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnREZXYgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zIHx8ICghb3B0aW9ucy50YXJnZXQgJiYgIW9wdGlvbnMuJCRpbmxpbmUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIndGFyZ2V0JyBpcyBhIHJlcXVpcmVkIG9wdGlvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcigpO1xuICAgIH1cbiAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuJGRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy4kZGVzdHJveSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29tcG9uZW50IHdhcyBhbHJlYWR5IGRlc3Ryb3llZCcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJGNhcHR1cmVfc3RhdGUoKSB7IH1cbiAgICAkaW5qZWN0X3N0YXRlKCkgeyB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgdG8gY3JlYXRlIHN0cm9uZ2x5IHR5cGVkIFN2ZWx0ZSBjb21wb25lbnRzLlxuICogVGhpcyBvbmx5IGV4aXN0cyBmb3IgdHlwaW5nIHB1cnBvc2VzIGFuZCBzaG91bGQgYmUgdXNlZCBpbiBgLmQudHNgIGZpbGVzLlxuICpcbiAqICMjIyBFeGFtcGxlOlxuICpcbiAqIFlvdSBoYXZlIGNvbXBvbmVudCBsaWJyYXJ5IG9uIG5wbSBjYWxsZWQgYGNvbXBvbmVudC1saWJyYXJ5YCwgZnJvbSB3aGljaFxuICogeW91IGV4cG9ydCBhIGNvbXBvbmVudCBjYWxsZWQgYE15Q29tcG9uZW50YC4gRm9yIFN2ZWx0ZStUeXBlU2NyaXB0IHVzZXJzLFxuICogeW91IHdhbnQgdG8gcHJvdmlkZSB0eXBpbmdzLiBUaGVyZWZvcmUgeW91IGNyZWF0ZSBhIGBpbmRleC5kLnRzYDpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBTdmVsdGVDb21wb25lbnRUeXBlZCB9IGZyb20gXCJzdmVsdGVcIjtcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkPHtmb286IHN0cmluZ30+IHt9XG4gKiBgYGBcbiAqIFR5cGluZyB0aGlzIG1ha2VzIGl0IHBvc3NpYmxlIGZvciBJREVzIGxpa2UgVlMgQ29kZSB3aXRoIHRoZSBTdmVsdGUgZXh0ZW5zaW9uXG4gKiB0byBwcm92aWRlIGludGVsbGlzZW5zZSBhbmQgdG8gdXNlIHRoZSBjb21wb25lbnQgbGlrZSB0aGlzIGluIGEgU3ZlbHRlIGZpbGVcbiAqIHdpdGggVHlwZVNjcmlwdDpcbiAqIGBgYHN2ZWx0ZVxuICogPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAqIFx0aW1wb3J0IHsgTXlDb21wb25lbnQgfSBmcm9tIFwiY29tcG9uZW50LWxpYnJhcnlcIjtcbiAqIDwvc2NyaXB0PlxuICogPE15Q29tcG9uZW50IGZvbz17J2Jhcid9IC8+XG4gKiBgYGBcbiAqXG4gKiAjIyMjIFdoeSBub3QgbWFrZSB0aGlzIHBhcnQgb2YgYFN2ZWx0ZUNvbXBvbmVudChEZXYpYD9cbiAqIEJlY2F1c2VcbiAqIGBgYHRzXG4gKiBjbGFzcyBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudDx7Zm9vOiBzdHJpbmd9PiB7fVxuICogY29uc3QgY29tcG9uZW50OiB0eXBlb2YgU3ZlbHRlQ29tcG9uZW50ID0gQVN1YmNsYXNzT2ZTdmVsdGVDb21wb25lbnQ7XG4gKiBgYGBcbiAqIHdpbGwgdGhyb3cgYSB0eXBlIGVycm9yLCBzbyB3ZSBuZWVkIHRvIHNlcGVyYXRlIHRoZSBtb3JlIHN0cmljdGx5IHR5cGVkIGNsYXNzLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnRUeXBlZCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudERldiB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsb29wX2d1YXJkKHRpbWVvdXQpIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydCA+IHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5maW5pdGUgbG9vcCBkZXRlY3RlZCcpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgSHRtbFRhZywgU3ZlbHRlQ29tcG9uZW50LCBTdmVsdGVDb21wb25lbnREZXYsIFN2ZWx0ZUNvbXBvbmVudFR5cGVkLCBTdmVsdGVFbGVtZW50LCBhY3Rpb25fZGVzdHJveWVyLCBhZGRfYXR0cmlidXRlLCBhZGRfY2xhc3NlcywgYWRkX2ZsdXNoX2NhbGxiYWNrLCBhZGRfbG9jYXRpb24sIGFkZF9yZW5kZXJfY2FsbGJhY2ssIGFkZF9yZXNpemVfbGlzdGVuZXIsIGFkZF90cmFuc2Zvcm0sIGFmdGVyVXBkYXRlLCBhcHBlbmQsIGFwcGVuZF9kZXYsIGFzc2lnbiwgYXR0ciwgYXR0cl9kZXYsIGF0dHJpYnV0ZV90b19vYmplY3QsIGJlZm9yZVVwZGF0ZSwgYmluZCwgYmluZGluZ19jYWxsYmFja3MsIGJsYW5rX29iamVjdCwgYnViYmxlLCBjaGVja19vdXRyb3MsIGNoaWxkcmVuLCBjbGFpbV9jb21wb25lbnQsIGNsYWltX2VsZW1lbnQsIGNsYWltX3NwYWNlLCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjcmVhdGVFdmVudERpc3BhdGNoZXIsIGNyZWF0ZV9hbmltYXRpb24sIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24sIGNyZWF0ZV9jb21wb25lbnQsIGNyZWF0ZV9pbl90cmFuc2l0aW9uLCBjcmVhdGVfb3V0X3RyYW5zaXRpb24sIGNyZWF0ZV9zbG90LCBjcmVhdGVfc3NyX2NvbXBvbmVudCwgY3VycmVudF9jb21wb25lbnQsIGN1c3RvbV9ldmVudCwgZGF0YXNldF9kZXYsIGRlYnVnLCBkZXN0cm95X2Jsb2NrLCBkZXN0cm95X2NvbXBvbmVudCwgZGVzdHJveV9lYWNoLCBkZXRhY2gsIGRldGFjaF9hZnRlcl9kZXYsIGRldGFjaF9iZWZvcmVfZGV2LCBkZXRhY2hfYmV0d2Vlbl9kZXYsIGRldGFjaF9kZXYsIGRpcnR5X2NvbXBvbmVudHMsIGRpc3BhdGNoX2RldiwgZWFjaCwgZWxlbWVudCwgZWxlbWVudF9pcywgZW1wdHksIGVzY2FwZSwgZXNjYXBlZCwgZXhjbHVkZV9pbnRlcm5hbF9wcm9wcywgZml4X2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfcG9zaXRpb24sIGZsdXNoLCBnZXRDb250ZXh0LCBnZXRfYmluZGluZ19ncm91cF92YWx1ZSwgZ2V0X2N1cnJlbnRfY29tcG9uZW50LCBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzLCBnZXRfc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0LCBnZXRfc3ByZWFkX29iamVjdCwgZ2V0X3NwcmVhZF91cGRhdGUsIGdldF9zdG9yZV92YWx1ZSwgZ2xvYmFscywgZ3JvdXBfb3V0cm9zLCBoYW5kbGVfcHJvbWlzZSwgaGFzQ29udGV4dCwgaGFzX3Byb3AsIGlkZW50aXR5LCBpbml0LCBpbnNlcnQsIGluc2VydF9kZXYsIGludHJvcywgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIsIGlzX2NsaWVudCwgaXNfY3Jvc3NvcmlnaW4sIGlzX2VtcHR5LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3RvcF9wcm9wYWdhdGlvbiwgc3Vic2NyaWJlLCBzdmdfZWxlbWVudCwgdGV4dCwgdGljaywgdGltZV9yYW5nZXNfdG9fYXJyYXksIHRvX251bWJlciwgdG9nZ2xlX2NsYXNzLCB0cmFuc2l0aW9uX2luLCB0cmFuc2l0aW9uX291dCwgdXBkYXRlX2F3YWl0X2Jsb2NrX2JyYW5jaCwgdXBkYXRlX2tleWVkX2VhY2gsIHVwZGF0ZV9zbG90LCB1cGRhdGVfc2xvdF9zcHJlYWQsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHhsaW5rX2F0dHIgfTtcbiIsInZhciBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0ID0gKHVuZGVmaW5lZCAmJiB1bmRlZmluZWQuX19jbGFzc1ByaXZhdGVGaWVsZFNldCkgfHwgZnVuY3Rpb24gKHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XG59O1xudmFyIF9fY2xhc3NQcml2YXRlRmllbGRHZXQgPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KSB8fCBmdW5jdGlvbiAocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XG59O1xudmFyIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBfbG9jYWwsIF9zZXNzaW9uLCBfYSQyO1xuY2xhc3MgU3RvcmFnZUZhY3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHN0b3JhZ2UpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvQ2xhc3Nlcy9Qcml2YXRlX2NsYXNzX2ZpZWxkc1xuICAgICAgICBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZS5zZXQodGhpcywgdm9pZCAwKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVpZCA9IG5ldyBEYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSh1aWQsIHVpZCk7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGUgPSBzdG9yYWdlLmdldEl0ZW0odWlkKSA9PSB1aWQ7XG4gICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0odWlkKTtcbiAgICAgICAgICAgIGlmIChhdmFpbGFibGUpXG4gICAgICAgICAgICAgICAgX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgc3RvcmFnZSwgXCJmXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBzdG9yYWdlIGlzIGF2YWlsYWJsZS5cbiAgICAgKi9cbiAgICBpc0F2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGVcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hc3NpZ25tZW50LFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybixcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAtLVxuICAgICAgICAtIHdlJ3JlIHVzaW5nIHRoZSBgdHJ5YCB0byBoYW5kbGUgYW55dGhpbmcgYmFkIGhhcHBlbmluZ1xuICAgICAgICAtIEpTT04ucGFyc2UgcmV0dXJucyBhbiBgYW55YCwgd2UgcmVhbGx5IGFyZSByZXR1cm5pbmcgYW4gYGFueWBcbiAgICAqL1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGFuIGl0ZW0gZnJvbSBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICovXG4gICAgZ2V0KGtleSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSwgZXhwaXJlcyB9ID0gSlNPTi5wYXJzZShfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LmdldEl0ZW0oa2V5KSA/PyAnJyk7XG4gICAgICAgICAgICAvLyBpcyB0aGlzIGl0ZW0gaGFzIHBhc3NlZCBpdHMgc2VsbC1ieS1kYXRlLCByZW1vdmUgaXRcbiAgICAgICAgICAgIGlmIChleHBpcmVzICYmIG5ldyBEYXRlKCkgPiBuZXcgRGF0ZShleHBpcmVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKGtleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qIGVzbGludC1lbmFibGVcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hc3NpZ25tZW50LFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybixcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICovXG4gICAgLyoqXG4gICAgICogU2F2ZSBhIHZhbHVlIHRvIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgZGF0YSB0byBzYXZlXG4gICAgICogQHBhcmFtIGV4cGlyZXMgLSBvcHRpb25hbCBkYXRlIG9uIHdoaWNoIHRoaXMgZGF0YSB3aWxsIGV4cGlyZVxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlLCBleHBpcmVzKSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGV4cGlyZXMsXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGl0ZW0gZnJvbSBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICovXG4gICAgcmVtb3ZlKGtleSkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5yZW1vdmVJdGVtKGtleSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGl0ZW1zIGZyb20gc3RvcmFnZS5cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uY2xlYXIoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYW4gaXRlbSBmcm9tIHN0b3JhZ2UgaW4gaXRzIHJhdyBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqL1xuICAgIGdldFJhdyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uZ2V0SXRlbShrZXkpID8/IG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNhdmUgYSByYXcgdmFsdWUgdG8gc3RvcmFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAgICAgKi9cbiAgICBzZXRSYXcoa2V5LCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIH1cbn1cbl9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogTWFuYWdlcyB1c2luZyBgbG9jYWxTdG9yYWdlYCBhbmQgYHNlc3Npb25TdG9yYWdlYC5cbiAqXG4gKiBIYXMgYSBmZXcgYWR2YW50YWdlcyBvdmVyIHRoZSBuYXRpdmUgQVBJLCBpbmNsdWRpbmdcbiAqIC0gZmFpbGluZyBncmFjZWZ1bGx5IGlmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZVxuICogLSB5b3UgY2FuIHNhdmUgYW5kIHJldHJpZXZlIGFueSBKU09OYWJsZSBkYXRhXG4gKlxuICogQWxsIG1ldGhvZHMgYXJlIGF2YWlsYWJsZSBmb3IgYm90aCBgbG9jYWxTdG9yYWdlYCBhbmQgYHNlc3Npb25TdG9yYWdlYC5cbiAqL1xuY29uc3Qgc3RvcmFnZSA9IG5ldyAoX2EkMiA9IGNsYXNzIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBfbG9jYWwuc2V0KHRoaXMsIHZvaWQgMCk7XG4gICAgICAgICAgICBfc2Vzc2lvbi5zZXQodGhpcywgdm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjcmVhdGluZyB0aGUgaW5zdGFuY2UgcmVxdWlyZXMgdGVzdGluZyB0aGUgbmF0aXZlIGltcGxlbWVudGF0aW9uXG4gICAgICAgIC8vIHdoaWNoIGlzIGJsb2NraW5nLiB0aGVyZWZvcmUsIG9ubHkgY3JlYXRlIG5ldyBpbnN0YW5jZXMgb2YgdGhlIGZhY3RvcnlcbiAgICAgICAgLy8gd2hlbiBpdCdzIGFjY2Vzc2VkIGkuZS4gd2Uga25vdyB3ZSdyZSBnb2luZyB0byB1c2UgaXRcbiAgICAgICAgZ2V0IGxvY2FsKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHRoaXMsIF9sb2NhbCwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfbG9jYWwsIFwiZlwiKSB8fCBuZXcgU3RvcmFnZUZhY3RvcnkobG9jYWxTdG9yYWdlKSwgXCJmXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgc2Vzc2lvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAoX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfc2Vzc2lvbiwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfc2Vzc2lvbiwgXCJmXCIpIHx8IG5ldyBTdG9yYWdlRmFjdG9yeShzZXNzaW9uU3RvcmFnZSksIFwiZlwiKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9sb2NhbCA9IG5ldyBXZWFrTWFwKCksXG4gICAgX3Nlc3Npb24gPSBuZXcgV2Vha01hcCgpLFxuICAgIF9hJDIpKCk7XG5cbi8qKlxuICogWW91IGNhbiBvbmx5IHN1YnNjcmliZSB0byB0ZWFtcyBmcm9tIHRoaXMgbGlzdC5cbiAqIEFkZCB5b3VyIHRlYW0gbmFtZSBiZWxvdyB0byBzdGFydCBsb2dnaW5nLlxuICpcbiAqIE1ha2Ugc3VyZSB5b3VyIGxhYmVsIGhhcyBhIGNvbnRyYXN0IHJhdGlvIG9mIDQuNSBvciBtb3JlLlxuICogKi9cbmNvbnN0IHRlYW1zID0ge1xuICAgIGNvbW1vbjoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzA1Mjk2MicsXG4gICAgICAgIGZvbnQ6ICcjZmZmZmZmJyxcbiAgICB9LFxuICAgIGNvbW1lcmNpYWw6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyM3N0VFQUEnLFxuICAgICAgICBmb250OiAnIzAwNDQwMCcsXG4gICAgfSxcbiAgICBjbXA6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGRjZCQjUnLFxuICAgICAgICBmb250OiAnIzJGMDQwNCcsXG4gICAgfSxcbiAgICBkb3Rjb206IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMwMDAwMDAnLFxuICAgICAgICBmb250OiAnI2ZmNzMwMCcsXG4gICAgfSxcbiAgICBkZXNpZ246IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMxODVFMzYnLFxuICAgICAgICBmb250OiAnI0ZGRjRGMicsXG4gICAgfSxcbiAgICB0eDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzJGNEY0RicsXG4gICAgICAgIGZvbnQ6ICcjRkZGRkZGJyxcbiAgICB9LFxufTtcblxuLyoqXG4gKlxuICogSGFuZGxlcyB0ZWFtLWJhc2VkIGxvZ2dpbmcgdG8gdGhlIGJyb3dzZXIgY29uc29sZVxuICpcbiAqIFByZXZlbnRzIGEgcHJvbGlmZXJhdGlvbiBvZiBjb25zb2xlLmxvZyBpbiBjbGllbnQtc2lkZVxuICogY29kZS5cbiAqXG4gKiBTdWJzY3JpYmluZyB0byBsb2dzIHJlbGllcyBvbiBMb2NhbFN0b3JhZ2VcbiAqL1xudmFyIF9hJDE7XG5jb25zdCBLRVkgPSAnZ3UubG9nZ2VyJztcbmNvbnN0IHRlYW1Db2xvdXJzID0gdGVhbXM7XG5jb25zdCBzdHlsZSA9ICh0ZWFtKSA9PiB7XG4gICAgY29uc3QgeyBiYWNrZ3JvdW5kLCBmb250IH0gPSB0ZWFtQ29sb3Vyc1t0ZWFtXTtcbiAgICByZXR1cm4gYGJhY2tncm91bmQ6ICR7YmFja2dyb3VuZH07IGNvbG9yOiAke2ZvbnR9OyBwYWRkaW5nOiAycHggM3B4OyBib3JkZXItcmFkaXVzOjNweGA7XG59O1xuLyoqXG4gKiBSdW5zIGluIGFsbCBlbnZpcm9ubWVudHMsIGlmIGxvY2FsIHN0b3JhZ2UgdmFsdWVzIGFyZSBzZXQuXG4gKi9cbmNvbnN0IGxvZyA9ICh0ZWFtLCAuLi5hcmdzKSA9PiB7XG4gICAgLy8gVE9ETyBhZGQgY2hlY2sgZm9yIGxvY2FsU3RvcmFnZVxuICAgIGlmICghKHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSkgfHwgJycpLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgc3R5bGVzID0gW3N0eWxlKCdjb21tb24nKSwgJycsIHN0eWxlKHRlYW0pLCAnJ107XG4gICAgY29uc29sZS5sb2coYCVjQGd1YXJkaWFuJWMgJWMke3RlYW19JWNgLCAuLi5zdHlsZXMsIC4uLmFyZ3MpO1xufTtcbi8qKlxuICogU3Vic2NyaWJlIHRvIGEgdGVhbeKAmXMgbG9nXG4gKiBAcGFyYW0gdGVhbSB0aGUgdGVhbeKAmXMgdW5pcXVlIElEXG4gKi9cbmNvbnN0IHN1YnNjcmliZVRvID0gKHRlYW0pID0+IHtcbiAgICBjb25zdCB0ZWFtU3Vic2NyaXB0aW9ucyA9IHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSlcbiAgICAgICAgPyBzdG9yYWdlLmxvY2FsLmdldChLRVkpLnNwbGl0KCcsJylcbiAgICAgICAgOiBbXTtcbiAgICBpZiAoIXRlYW1TdWJzY3JpcHRpb25zLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICB0ZWFtU3Vic2NyaXB0aW9ucy5wdXNoKHRlYW0pO1xuICAgIHN0b3JhZ2UubG9jYWwuc2V0KEtFWSwgdGVhbVN1YnNjcmlwdGlvbnMuam9pbignLCcpKTtcbiAgICBsb2codGVhbSwgJ/CflJQgU3Vic2NyaWJlZCwgaGVsbG8hJyk7XG59O1xuLyoqXG4gKiBVbnN1YnNjcmliZSB0byBhIHRlYW3igJlzIGxvZ1xuICogQHBhcmFtIHRlYW0gdGhlIHRlYW3igJlzIHVuaXF1ZSBJRFxuICovXG5jb25zdCB1bnN1YnNjcmliZUZyb20gPSAodGVhbSkgPT4ge1xuICAgIGxvZyh0ZWFtLCAn8J+UlSBVbnN1YnNjcmliZWQsIGdvb2QtYnllIScpO1xuICAgIGNvbnN0IHRlYW1TdWJzY3JpcHRpb25zID0gc3RvcmFnZS5sb2NhbC5nZXQoS0VZKVxuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAuZmlsdGVyKCh0KSA9PiB0ICE9PSB0ZWFtKTtcbiAgICBzdG9yYWdlLmxvY2FsLnNldChLRVksIHRlYW1TdWJzY3JpcHRpb25zLmpvaW4oJywnKSk7XG59O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5ndWFyZGlhbiB8fCAod2luZG93Lmd1YXJkaWFuID0ge30pO1xuICAgIChfYSQxID0gd2luZG93Lmd1YXJkaWFuKS5sb2dnZXIgfHwgKF9hJDEubG9nZ2VyID0ge1xuICAgICAgICBzdWJzY3JpYmVUbyxcbiAgICAgICAgdW5zdWJzY3JpYmVGcm9tLFxuICAgICAgICB0ZWFtczogKCkgPT4gT2JqZWN0LmtleXModGVhbUNvbG91cnMpLFxuICAgIH0pO1xufVxuXG5sZXQgY3VycmVudEZyYW1ld29yaztcbmNvbnN0IHNldEN1cnJlbnRGcmFtZXdvcmsgPSAoZnJhbWV3b3JrKSA9PiB7XG4gICAgbG9nKCdjbXAnLCBgRnJhbWV3b3JrIHNldCB0byAke2ZyYW1ld29ya31gKTtcbiAgICBjdXJyZW50RnJhbWV3b3JrID0gZnJhbWV3b3JrO1xufTtcbmNvbnN0IGdldEN1cnJlbnRGcmFtZXdvcmsgPSAoKSA9PiBjdXJyZW50RnJhbWV3b3JrO1xuXG5jb25zdCBtYXJrID0gKGxhYmVsKSA9PiB7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlPy5tYXJrPy4obGFiZWwpO1xuICAgIHtcbiAgICAgICAgbG9nKCdjbXAnLCAnW2V2ZW50XScsIGxhYmVsKTtcbiAgICB9XG59O1xuXG5jb25zdCBpc1NlcnZlclNpZGUgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJztcbmNvbnN0IHNlcnZlclNpZGVXYXJuID0gKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybignVGhpcyBpcyBhIHNlcnZlci1zaWRlIHZlcnNpb24gb2YgdGhlIEBndWFyZGlhbi9jb25zZW50LW1hbmFnZW1lbnQtcGxhdGZvcm0nLCAnTm8gY29uc2VudCBzaWduYWxzIHdpbGwgYmUgcmVjZWl2ZWQuJyk7XG59O1xuY29uc3Qgc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4gPSAoYXJnKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc2VydmVyU2lkZVdhcm4oKTtcbiAgICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xufTtcbmNvbnN0IGNtcCQxID0ge1xuICAgIF9fZGlzYWJsZTogc2VydmVyU2lkZVdhcm4sXG4gICAgX19lbmFibGU6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbiAgICBfX2lzRGlzYWJsZWQ6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbiAgICBoYXNJbml0aWFsaXNlZDogc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4oZmFsc2UpLFxuICAgIGluaXQ6IHNlcnZlclNpZGVXYXJuLFxuICAgIHNob3dQcml2YWN5TWFuYWdlcjogc2VydmVyU2lkZVdhcm4sXG4gICAgdmVyc2lvbjogJ24vYScsXG4gICAgd2lsbFNob3dQcml2YWN5TWVzc2FnZTogc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4oUHJvbWlzZS5yZXNvbHZlKGZhbHNlKSksXG4gICAgd2lsbFNob3dQcml2YWN5TWVzc2FnZVN5bmM6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbn07XG5jb25zdCBvbkNvbnNlbnQkMiA9ICgpID0+IHtcbiAgICBzZXJ2ZXJTaWRlV2FybigpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBjYW5UYXJnZXQ6IGZhbHNlLFxuICAgICAgICBmcmFtZXdvcms6IG51bGwsXG4gICAgfSk7XG59O1xuY29uc3Qgb25Db25zZW50Q2hhbmdlJDIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlcnZlclNpZGVXYXJuKCk7XG59O1xuY29uc3QgZ2V0Q29uc2VudEZvciQyID0gKHZlbmRvciwgY29uc2VudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTZXJ2ZXItc2lkZSBjYWxsIGZvciBnZXRDb25zZW50Rm9yKCR7dmVuZG9yfSwgJHtKU09OLnN0cmluZ2lmeShjb25zZW50KX0pYCwgJ2dldENvbnNlbnRGb3Igd2lsbCBhbHdheXMgcmV0dXJuIGZhbHNlIHNlcnZlci1zaWRlJyk7XG4gICAgc2VydmVyU2lkZVdhcm4oKTtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5sZXQgaXNHdWFyZGlhbjtcbmNvbnN0IGlzR3VhcmRpYW5Eb21haW4gPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBpc0d1YXJkaWFuID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoaXNTZXJ2ZXJTaWRlKSB7XG4gICAgICAgICAgICBpc0d1YXJkaWFuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlzR3VhcmRpYW4gPSB3aW5kb3cubG9jYXRpb24uaG9zdC5lbmRzV2l0aCgnLnRoZWd1YXJkaWFuLmNvbScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpc0d1YXJkaWFuO1xufTtcblxuY29uc3QgQUNDT1VOVF9JRCA9IDEyNTc7XG5jb25zdCBQUklWQUNZX01BTkFHRVJfQ0NQQSA9IDU0MDI1MjtcbmNvbnN0IFBSSVZBQ1lfTUFOQUdFUl9UQ0ZWMiA9IDEwNjg0MjtcbmNvbnN0IFBSSVZBQ1lfTUFOQUdFUl9BVVNUUkFMSUEgPSA1NDAzNDE7XG5jb25zdCBFTkRQT0lOVCA9IGlzR3VhcmRpYW5Eb21haW4oKVxuICAgID8gJ2h0dHBzOi8vc291cmNlcG9pbnQudGhlZ3VhcmRpYW4uY29tJ1xuICAgIDogJ2h0dHBzOi8vY2RuLnByaXZhY3ktbWdtdC5jb20nO1xuXG5jb25zdCBhcGkkMiA9IChjb21tYW5kKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHdpbmRvdy5fX3VzcGFwaSkge1xuICAgICAgICB3aW5kb3cuX191c3BhcGkoY29tbWFuZCwgMSwgKHJlc3VsdCwgc3VjY2VzcykgPT4gc3VjY2Vzc1xuICAgICAgICAgICAgPyByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZ2V0ICR7Y29tbWFuZH0gZGF0YWApKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdObyBfX3VzcGFwaSBmb3VuZCBvbiB3aW5kb3cnKSk7XG4gICAgfVxufSk7XG5jb25zdCBnZXRVU1BEYXRhJDEgPSAoKSA9PiBhcGkkMignZ2V0VVNQRGF0YScpO1xuXG5jb25zdCBnZXRDb25zZW50U3RhdGUkMyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB1c3BEYXRhID0gYXdhaXQgZ2V0VVNQRGF0YSQxKCk7XG4gICAgY29uc3Qgb3B0ZWRPdXQgPSB1c3BEYXRhLnVzcFN0cmluZy5jaGFyQXQoMikgPT09ICdZJztcbiAgICByZXR1cm4ge1xuICAgICAgICBwZXJzb25hbGlzZWRBZHZlcnRpc2luZzogIW9wdGVkT3V0LFxuICAgIH07XG59O1xuXG5jb25zdCBhcGkkMSA9IChjb21tYW5kKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHdpbmRvdy5fX3VzcGFwaSkge1xuICAgICAgICB3aW5kb3cuX191c3BhcGkoY29tbWFuZCwgMSwgKHJlc3VsdCwgc3VjY2VzcykgPT4gc3VjY2Vzc1xuICAgICAgICAgICAgPyByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZ2V0ICR7Y29tbWFuZH0gZGF0YWApKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdObyBfX3VzcGFwaSBmb3VuZCBvbiB3aW5kb3cnKSk7XG4gICAgfVxufSk7XG5jb25zdCBnZXRVU1BEYXRhID0gKCkgPT4gYXBpJDEoJ2dldFVTUERhdGEnKTtcblxuY29uc3QgZ2V0Q29uc2VudFN0YXRlJDIgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdXNwRGF0YSA9IGF3YWl0IGdldFVTUERhdGEoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb05vdFNlbGw6IHVzcERhdGEudXNwU3RyaW5nLmNoYXJBdCgyKSA9PT0gJ1knLFxuICAgIH07XG59O1xuXG5jb25zdCBnZXRHcGNTaWduYWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGlzU2VydmVyU2lkZSA/IHVuZGVmaW5lZCA6IG5hdmlnYXRvci5nbG9iYWxQcml2YWN5Q29udHJvbDtcbn07XG5cbmNvbnN0IGFwaSA9IChjb21tYW5kKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHdpbmRvdy5fX3RjZmFwaSkge1xuICAgICAgICB3aW5kb3cuX190Y2ZhcGkoY29tbWFuZCwgMiwgKHJlc3VsdCwgc3VjY2VzcykgPT4gc3VjY2Vzc1xuICAgICAgICAgICAgPyByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZ2V0ICR7Y29tbWFuZH0gZGF0YWApKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdObyBfX3RjZmFwaSBmb3VuZCBvbiB3aW5kb3cnKSk7XG4gICAgfVxufSk7XG5jb25zdCBnZXRUQ0RhdGEgPSAoKSA9PiBhcGkoJ2dldFRDRGF0YScpO1xuY29uc3QgZ2V0Q3VzdG9tVmVuZG9yQ29uc2VudHMgPSAoKSA9PiBhcGkoJ2dldEN1c3RvbVZlbmRvckNvbnNlbnRzJyk7XG5cbmNvbnN0IGRlZmF1bHRDb25zZW50cyA9IHtcbiAgICAnMSc6IGZhbHNlLFxuICAgICcyJzogZmFsc2UsXG4gICAgJzMnOiBmYWxzZSxcbiAgICAnNCc6IGZhbHNlLFxuICAgICc1JzogZmFsc2UsXG4gICAgJzYnOiBmYWxzZSxcbiAgICAnNyc6IGZhbHNlLFxuICAgICc4JzogZmFsc2UsXG4gICAgJzknOiBmYWxzZSxcbiAgICAnMTAnOiBmYWxzZSxcbn07XG5jb25zdCBnZXRDb25zZW50U3RhdGUkMSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBbdGNEYXRhLCBjdXN0b21WZW5kb3JzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0VENEYXRhKCksXG4gICAgICAgIGdldEN1c3RvbVZlbmRvckNvbnNlbnRzKCksXG4gICAgXSk7XG4gICAgaWYgKHR5cGVvZiB0Y0RhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRGcmFtZXdvcmsgPSBnZXRDdXJyZW50RnJhbWV3b3JrKCkgPz8gJ3VuZGVmaW5lZCc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gVEMgRGF0YSBmb3VuZCB3aXRoIGN1cnJlbnQgZnJhbWV3b3JrOiAke2N1cnJlbnRGcmFtZXdvcmt9YCk7XG4gICAgfVxuICAgIGNvbnN0IGNvbnNlbnRzID0ge1xuICAgICAgICAuLi5kZWZhdWx0Q29uc2VudHMsXG4gICAgICAgIC4uLnRjRGF0YS5wdXJwb3NlLmNvbnNlbnRzLFxuICAgIH07XG4gICAgY29uc3QgeyBldmVudFN0YXR1cywgZ2RwckFwcGxpZXMsIHRjU3RyaW5nLCBhZGR0bENvbnNlbnQgfSA9IHRjRGF0YTtcbiAgICBjb25zdCB7IGdyYW50cyB9ID0gY3VzdG9tVmVuZG9ycztcbiAgICBjb25zdCB2ZW5kb3JDb25zZW50cyA9IE9iamVjdC5rZXlzKGdyYW50cylcbiAgICAgICAgLnNvcnQoKVxuICAgICAgICAucmVkdWNlKChhY2MsIGN1cikgPT4gKHsgLi4uYWNjLCBbY3VyXTogZ3JhbnRzW2N1cl0udmVuZG9yR3JhbnQgfSksIHt9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25zZW50cyxcbiAgICAgICAgZXZlbnRTdGF0dXMsXG4gICAgICAgIHZlbmRvckNvbnNlbnRzLFxuICAgICAgICBhZGR0bENvbnNlbnQsXG4gICAgICAgIGdkcHJBcHBsaWVzLFxuICAgICAgICB0Y1N0cmluZyxcbiAgICB9O1xufTtcblxuY29uc3QgY2FsbEJhY2tRdWV1ZSA9IFtdO1xuY29uc3QgYXdhaXRpbmdVc2VySW50ZXJhY3Rpb25JblRDRnYyID0gKHN0YXRlKSA9PiBzdGF0ZS50Y2Z2Mj8uZXZlbnRTdGF0dXMgPT09ICdjbXB1aXNob3duJztcbmNvbnN0IGludm9rZUNhbGxiYWNrID0gKGNhbGxiYWNrLCBzdGF0ZSkgPT4ge1xuICAgIGlmIChhd2FpdGluZ1VzZXJJbnRlcmFjdGlvbkluVENGdjIoc3RhdGUpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgc3RhdGVTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSk7XG4gICAgaWYgKHN0YXRlU3RyaW5nICE9PSBjYWxsYmFjay5sYXN0U3RhdGUpIHtcbiAgICAgICAgY2FsbGJhY2suZm4oc3RhdGUpO1xuICAgICAgICBjYWxsYmFjay5sYXN0U3RhdGUgPSBzdGF0ZVN0cmluZztcbiAgICB9XG59O1xuY29uc3QgZW5oYW5jZUNvbnNlbnRTdGF0ZSA9IChjb25zZW50U3RhdGUpID0+IHtcbiAgICBjb25zdCBncGNTaWduYWwgPSBnZXRHcGNTaWduYWwoKTtcbiAgICBpZiAoY29uc2VudFN0YXRlLnRjZnYyKSB7XG4gICAgICAgIGNvbnN0IGNvbnNlbnRzID0gY29uc2VudFN0YXRlLnRjZnYyLmNvbnNlbnRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uY29uc2VudFN0YXRlLFxuICAgICAgICAgICAgY2FuVGFyZ2V0OiBPYmplY3Qua2V5cyhjb25zZW50cykubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXMoY29uc2VudHMpLmV2ZXJ5KEJvb2xlYW4pLFxuICAgICAgICAgICAgZnJhbWV3b3JrOiAndGNmdjInLFxuICAgICAgICAgICAgZ3BjU2lnbmFsLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChjb25zZW50U3RhdGUuY2NwYSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uY29uc2VudFN0YXRlLFxuICAgICAgICAgICAgY2FuVGFyZ2V0OiAhY29uc2VudFN0YXRlLmNjcGEuZG9Ob3RTZWxsLFxuICAgICAgICAgICAgZnJhbWV3b3JrOiAnY2NwYScsXG4gICAgICAgICAgICBncGNTaWduYWwsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGNvbnNlbnRTdGF0ZS5hdXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmNvbnNlbnRTdGF0ZSxcbiAgICAgICAgICAgIGNhblRhcmdldDogY29uc2VudFN0YXRlLmF1cy5wZXJzb25hbGlzZWRBZHZlcnRpc2luZyxcbiAgICAgICAgICAgIGZyYW1ld29yazogJ2F1cycsXG4gICAgICAgICAgICBncGNTaWduYWwsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNvbnNlbnRTdGF0ZSxcbiAgICAgICAgY2FuVGFyZ2V0OiBmYWxzZSxcbiAgICAgICAgZnJhbWV3b3JrOiBudWxsLFxuICAgICAgICBncGNTaWduYWwsXG4gICAgfTtcbn07XG5jb25zdCBnZXRDb25zZW50U3RhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgc3dpdGNoIChnZXRDdXJyZW50RnJhbWV3b3JrKCkpIHtcbiAgICAgICAgY2FzZSAnYXVzJzpcbiAgICAgICAgICAgIHJldHVybiBlbmhhbmNlQ29uc2VudFN0YXRlKHsgYXVzOiBhd2FpdCBnZXRDb25zZW50U3RhdGUkMygpIH0pO1xuICAgICAgICBjYXNlICdjY3BhJzpcbiAgICAgICAgICAgIHJldHVybiBlbmhhbmNlQ29uc2VudFN0YXRlKHsgY2NwYTogYXdhaXQgZ2V0Q29uc2VudFN0YXRlJDIoKSB9KTtcbiAgICAgICAgY2FzZSAndGNmdjInOlxuICAgICAgICAgICAgcmV0dXJuIGVuaGFuY2VDb25zZW50U3RhdGUoeyB0Y2Z2MjogYXdhaXQgZ2V0Q29uc2VudFN0YXRlJDEoKSB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gSUFCIGNvbnNlbnQgZnJhbWV3b3JrIGZvdW5kIG9uIHRoZSBwYWdlJyk7XG4gICAgfVxufTtcbmNvbnN0IGludm9rZUNhbGxiYWNrcyA9ICgpID0+IHtcbiAgICBpZiAoY2FsbEJhY2tRdWV1ZS5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybjtcbiAgICB2b2lkIGdldENvbnNlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlKSA9PiB7XG4gICAgICAgIGlmIChhd2FpdGluZ1VzZXJJbnRlcmFjdGlvbkluVENGdjIoc3RhdGUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYWxsQmFja1F1ZXVlLmZvckVhY2goKGNhbGxiYWNrKSA9PiBpbnZva2VDYWxsYmFjayhjYWxsYmFjaywgc3RhdGUpKTtcbiAgICB9KTtcbn07XG5jb25zdCBvbkNvbnNlbnRDaGFuZ2UkMSA9IChjYWxsQmFjaykgPT4ge1xuICAgIGNvbnN0IG5ld0NhbGxiYWNrID0geyBmbjogY2FsbEJhY2sgfTtcbiAgICBjYWxsQmFja1F1ZXVlLnB1c2gobmV3Q2FsbGJhY2spO1xuICAgIHZvaWQgZ2V0Q29uc2VudFN0YXRlKClcbiAgICAgICAgLnRoZW4oKGNvbnNlbnRTdGF0ZSkgPT4ge1xuICAgICAgICBpbnZva2VDYWxsYmFjayhuZXdDYWxsYmFjaywgY29uc2VudFN0YXRlKTtcbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgIH0pO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgLS0gdGhpcyBpcyB0aGlyZCBwYXJ0eSBjb2RlICovXG4vKiBpc3RhbmJ1bCBpZ25vcmUgZmlsZSAqL1xuXG4vKlxuVGhpcyBjb2RlIGlzIHRoZSBDQ1BBIHN0dWIgbWFkZSBhdmFpbGFibGUgYnkgU291cmNlcG9pbnQuXG5cblNlZSB0aGUgZG9jdW1lbnRhdGlvbiBvbiBob3cgdG8gcmV0cmlldmUgdGhlIGxhdGVzdCB2ZXJzaW9uOlxuaHR0cHM6Ly9kb2N1bWVudGF0aW9uLnNvdXJjZXBvaW50LmNvbS9pbXBsZW1lbnRhdGlvbi93ZWItaW1wbGVtZW50YXRpb24vbXVsdGktY2FtcGFpZ24td2ViLWltcGxlbWVudGF0aW9uI3N0dWItZmlsZVxuKi9cblxuY29uc3Qgc3R1Yl9jY3BhID0gKCkgPT4ge1xuXHQoZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlID0gZmFsc2U7XG5cdFx0dmFyIGMgPSB3aW5kb3c7XG5cdFx0dmFyIHQgPSBkb2N1bWVudDtcblx0XHRmdW5jdGlvbiByKCkge1xuXHRcdFx0aWYgKCFjLmZyYW1lc1snX191c3BhcGlMb2NhdG9yJ10pIHtcblx0XHRcdFx0aWYgKHQuYm9keSkge1xuXHRcdFx0XHRcdHZhciBhID0gdC5ib2R5O1xuXHRcdFx0XHRcdHZhciBlID0gdC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblx0XHRcdFx0XHRlLnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpub25lJztcblx0XHRcdFx0XHRlLm5hbWUgPSAnX191c3BhcGlMb2NhdG9yJztcblx0XHRcdFx0XHRhLmFwcGVuZENoaWxkKGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQociwgNSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cigpO1xuXHRcdGZ1bmN0aW9uIHAoKSB7XG5cdFx0XHR2YXIgYSA9IGFyZ3VtZW50cztcblx0XHRcdF9fdXNwYXBpLmEgPSBfX3VzcGFwaS5hIHx8IFtdO1xuXHRcdFx0aWYgKCFhLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gX191c3BhcGkuYTtcblx0XHRcdH0gZWxzZSBpZiAoYVswXSA9PT0gJ3BpbmcnKSB7XG5cdFx0XHRcdGFbMl0oeyBnZHByQXBwbGllc0dsb2JhbGx5OiBlLCBjbXBMb2FkZWQ6IGZhbHNlIH0sIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X191c3BhcGkuYS5wdXNoKFtdLnNsaWNlLmFwcGx5KGEpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gbCh0KSB7XG5cdFx0XHR2YXIgciA9IHR5cGVvZiB0LmRhdGEgPT09ICdzdHJpbmcnO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dmFyIGEgPSByID8gSlNPTi5wYXJzZSh0LmRhdGEpIDogdC5kYXRhO1xuXHRcdFx0XHRpZiAoYS5fX2NtcENhbGwpIHtcblx0XHRcdFx0XHR2YXIgbiA9IGEuX19jbXBDYWxsO1xuXHRcdFx0XHRcdGMuX191c3BhcGkobi5jb21tYW5kLCBuLnBhcmFtZXRlciwgZnVuY3Rpb24gKGEsIGUpIHtcblx0XHRcdFx0XHRcdHZhciBjID0ge1xuXHRcdFx0XHRcdFx0XHRfX2NtcFJldHVybjoge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVyblZhbHVlOiBhLFxuXHRcdFx0XHRcdFx0XHRcdHN1Y2Nlc3M6IGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2FsbElkOiBuLmNhbGxJZCxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0LnNvdXJjZS5wb3N0TWVzc2FnZShyID8gSlNPTi5zdHJpbmdpZnkoYykgOiBjLCAnKicpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChhKSB7fVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIF9fdXNwYXBpICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjLl9fdXNwYXBpID0gcDtcblx0XHRcdF9fdXNwYXBpLm1zZ0hhbmRsZXIgPSBsO1xuXHRcdFx0Yy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbCwgZmFsc2UpO1xuXHRcdH1cblx0fSkoKTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIC0tIHRoaXMgaXMgdGhpcmQgcGFydHkgY29kZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIGZpbGUgKi9cblxuLypcblRoaXMgY29kZSBpcyB0aGUgVENGdjIgc3R1YiBtYWRlIGF2YWlsYWJsZSBieSBTb3VyY2Vwb2ludC5cblxuU2VlIHRoZSBkb2N1bWVudGF0aW9uIG9uIGhvdyB0byByZXRyaWV2ZSB0aGUgbGF0ZXN0IHZlcnNpb246XG5odHRwczovL2RvY3VtZW50YXRpb24uc291cmNlcG9pbnQuY29tL2ltcGxlbWVudGF0aW9uL3dlYi1pbXBsZW1lbnRhdGlvbi9tdWx0aS1jYW1wYWlnbi13ZWItaW1wbGVtZW50YXRpb24jc3R1Yi1maWxlXG4qL1xuXG5jb25zdCBzdHViX3RjZnYyID0gKCkgPT4ge1xuXHQhKGZ1bmN0aW9uICh0KSB7XG5cdFx0dmFyIGUgPSB7fTtcblx0XHRmdW5jdGlvbiBuKHIpIHtcblx0XHRcdGlmIChlW3JdKSByZXR1cm4gZVtyXS5leHBvcnRzO1xuXHRcdFx0dmFyIG8gPSAoZVtyXSA9IHsgaTogciwgbDogITEsIGV4cG9ydHM6IHt9IH0pO1xuXHRcdFx0cmV0dXJuIHRbcl0uY2FsbChvLmV4cG9ydHMsIG8sIG8uZXhwb3J0cywgbiksIChvLmwgPSAhMCksIG8uZXhwb3J0cztcblx0XHR9XG5cdFx0KG4ubSA9IHQpLFxuXHRcdFx0KG4uYyA9IGUpLFxuXHRcdFx0KG4uZCA9IGZ1bmN0aW9uICh0LCBlLCByKSB7XG5cdFx0XHRcdG4ubyh0LCBlKSB8fFxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LCBlLCB7IGVudW1lcmFibGU6ICEwLCBnZXQ6IHIgfSk7XG5cdFx0XHR9KSxcblx0XHRcdChuLnIgPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHQndW5kZWZpbmVkJyAhPSB0eXBlb2YgU3ltYm9sICYmXG5cdFx0XHRcdFx0U3ltYm9sLnRvU3RyaW5nVGFnICYmXG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsIFN5bWJvbC50b1N0cmluZ1RhZywge1xuXHRcdFx0XHRcdFx0dmFsdWU6ICdNb2R1bGUnLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LCAnX19lc01vZHVsZScsIHsgdmFsdWU6ICEwIH0pO1xuXHRcdFx0fSksXG5cdFx0XHQobi50ID0gZnVuY3Rpb24gKHQsIGUpIHtcblx0XHRcdFx0aWYgKCgxICYgZSAmJiAodCA9IG4odCkpLCA4ICYgZSkpIHJldHVybiB0O1xuXHRcdFx0XHRpZiAoNCAmIGUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHQgJiYgdCAmJiB0Ll9fZXNNb2R1bGUpXG5cdFx0XHRcdFx0cmV0dXJuIHQ7XG5cdFx0XHRcdHZhciByID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdChuLnIociksXG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHIsICdkZWZhdWx0Jywge1xuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogITAsXG5cdFx0XHRcdFx0XHR2YWx1ZTogdCxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHQyICYgZSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdClcblx0XHRcdFx0KVxuXHRcdFx0XHRcdGZvciAodmFyIG8gaW4gdClcblx0XHRcdFx0XHRcdG4uZChcblx0XHRcdFx0XHRcdFx0cixcblx0XHRcdFx0XHRcdFx0byxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdFtlXTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKG51bGwsIG8pLFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHI7XG5cdFx0XHR9KSxcblx0XHRcdChuLm4gPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHR2YXIgZSA9XG5cdFx0XHRcdFx0dCAmJiB0Ll9fZXNNb2R1bGVcblx0XHRcdFx0XHRcdD8gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0LmRlZmF1bHQ7XG5cdFx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHRcdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0O1xuXHRcdFx0XHRcdFx0ICB9O1xuXHRcdFx0XHRyZXR1cm4gbi5kKGUsICdhJywgZSksIGU7XG5cdFx0XHR9KSxcblx0XHRcdChuLm8gPSBmdW5jdGlvbiAodCwgZSkge1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIGUpO1xuXHRcdFx0fSksXG5cdFx0XHQobi5wID0gJycpLFxuXHRcdFx0bigobi5zID0gMykpO1xuXHR9KShbXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbigyKTtcblx0XHRcdHQuZXhwb3J0cyA9ICFyKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQ3ICE9XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtcblx0XHRcdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gNztcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSkuYVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSkge1xuXHRcdFx0dC5leHBvcnRzID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0cmV0dXJuICdvYmplY3QnID09IHR5cGVvZiB0XG5cdFx0XHRcdFx0PyBudWxsICE9PSB0XG5cdFx0XHRcdFx0OiAnZnVuY3Rpb24nID09IHR5cGVvZiB0O1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlKSB7XG5cdFx0XHR0LmV4cG9ydHMgPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiAhIXQoKTtcblx0XHRcdFx0fSBjYXRjaCAodCkge1xuXHRcdFx0XHRcdHJldHVybiAhMDtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHRuKDQpLFxuXHRcdFx0XHQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmICgnZnVuY3Rpb24nICE9IHR5cGVvZiB3aW5kb3cuX190Y2ZhcGkpIHtcblx0XHRcdFx0XHRcdHZhciB0LFxuXHRcdFx0XHRcdFx0XHRlID0gW10sXG5cdFx0XHRcdFx0XHRcdG4gPSB3aW5kb3csXG5cdFx0XHRcdFx0XHRcdHIgPSBuLmRvY3VtZW50O1xuXHRcdFx0XHRcdFx0IW4uX190Y2ZhcGkgJiZcblx0XHRcdFx0XHRcdFx0KGZ1bmN0aW9uIHQoKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGUgPSAhIW4uZnJhbWVzLl9fdGNmYXBpTG9jYXRvcjtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoci5ib2R5KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBvID0gci5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KG8uc3R5bGUuY3NzVGV4dCA9ICdkaXNwbGF5Om5vbmUnKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQoby5uYW1lID0gJ19fdGNmYXBpTG9jYXRvcicpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHIuYm9keS5hcHBlbmRDaGlsZChvKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBzZXRUaW1lb3V0KHQsIDUpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiAhZTtcblx0XHRcdFx0XHRcdFx0fSkoKSAmJlxuXHRcdFx0XHRcdFx0XHQoKG4uX190Y2ZhcGkgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBuID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0ciA9IG5ldyBBcnJheShuKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0byA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0XHRvIDwgbjtcblx0XHRcdFx0XHRcdFx0XHRcdG8rK1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdHJbb10gPSBhcmd1bWVudHNbb107XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFyLmxlbmd0aCkgcmV0dXJuIGU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCdzZXRHZHByQXBwbGllcycgPT09IHJbMF0pXG5cdFx0XHRcdFx0XHRcdFx0XHRyLmxlbmd0aCA+IDMgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0MiA9PT0gcGFyc2VJbnQoclsxXSwgMTApICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdib29sZWFuJyA9PSB0eXBlb2YgclszXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQoKHQgPSByWzNdKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0J2Z1bmN0aW9uJyA9PSB0eXBlb2YgclsyXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJbMl0oJ3NldCcsICEwKSk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoJ3BpbmcnID09PSByWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgaSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z2RwckFwcGxpZXM6IHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNtcExvYWRlZDogITEsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFwaVZlcnNpb246ICcyLjAnLFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdCdmdW5jdGlvbicgPT0gdHlwZW9mIHJbMl0gJiYgclsyXShpLCAhMCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGUucHVzaChyKTtcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdG4uYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0XHRcdFx0XHQnbWVzc2FnZScsXG5cdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlID0gJ3N0cmluZycgPT0gdHlwZW9mIHQuZGF0YSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0ciA9IHt9O1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ciA9IGUgPyBKU09OLnBhcnNlKHQuZGF0YSkgOiB0LmRhdGE7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoICh0KSB7fVxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIG8gPSByLl9fdGNmYXBpQ2FsbDtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFdBUk5JTkdcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgZnVuY3Rpb24gY2FsbCBoYXMgYmVlbiBtb2RpZmllZCBmcm9tIHRoZSBwcm92aWRlZCBTb3VyY2Vwb2ludCBjb2RlLlxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gVGhlIHBhcmFtZXRlciBvcmRlciBoYXMgYmVlbiB1cGRhdGVkIGFzIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBjYWxsIHdhcyBpbmNvcnJlY3QgYXMgcGVyIHRoZSBUQ0Ygc3BlY2lmaWNhdGlvbi5cblx0XHRcdFx0XHRcdFx0XHRcdC8vIFNlZTpcblx0XHRcdFx0XHRcdFx0XHRcdC8vIC0gUmVxdWlyZWQgaW50ZXJmYWNlOiBodHRwczovL2dpdGh1Yi5jb20vSW50ZXJhY3RpdmVBZHZlcnRpc2luZ0J1cmVhdS9HRFBSLVRyYW5zcGFyZW5jeS1hbmQtQ29uc2VudC1GcmFtZXdvcmsvYmxvYi9tYXN0ZXIvVENGdjIvSUFCJTIwVGVjaCUyMExhYiUyMC0lMjBDTVAlMjBBUEklMjB2Mi5tZCNob3ctZG9lcy10aGUtY21wLXByb3ZpZGUtdGhlLWFwaVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gLSBVcGRhdGUgdG8gZnVuY3Rpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9ndWFyZGlhbi9jb25zZW50LW1hbmFnZW1lbnQtcGxhdGZvcm0vcHVsbC81NjEvY29tbWl0cy9mNjExM2Y0YTFmOGZiZTZjZWM1YjRlYThlN2IyOWI5NjlmZGI2MGYzI2RpZmYtYjU4MzEzYzBhYjVmN2IzYzM1YzlkNzg4YTFlMzdlMThjOTgyZmVmN2ZiOGE5YjU2MmQ3MjgxNjNmZmI4YThhMUwxNTJcblx0XHRcdFx0XHRcdFx0XHRcdG8gJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0bi5fX3RjZmFwaShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvLmNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0by52ZXJzaW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChuLCByKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgaSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X190Y2ZhcGlSZXR1cm46IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm5WYWx1ZTogbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdWNjZXNzOiByLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhbGxJZDogby5jYWxsSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZSAmJiAoaSA9IEpTT04uc3RyaW5naWZ5KGkpKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dC5zb3VyY2UucG9zdE1lc3NhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnKicsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvLnBhcmFtZXRlcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdCExLFxuXHRcdFx0XHRcdFx0XHQpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKCk7XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0dmFyIHIgPSBuKDApLFxuXHRcdFx0XHRvID0gbig1KS5mLFxuXHRcdFx0XHRpID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHRjID0gaS50b1N0cmluZyxcblx0XHRcdFx0dSA9IC9ecypmdW5jdGlvbiAoW14gKF0qKS87XG5cdFx0XHRyICYmXG5cdFx0XHRcdCEoJ25hbWUnIGluIGkpICYmXG5cdFx0XHRcdG8oaSwgJ25hbWUnLCB7XG5cdFx0XHRcdFx0Y29uZmlndXJhYmxlOiAhMCxcblx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBjLmNhbGwodGhpcykubWF0Y2godSlbMV07XG5cdFx0XHRcdFx0XHR9IGNhdGNoICh0KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHR2YXIgciA9IG4oMCksXG5cdFx0XHRcdG8gPSBuKDYpLFxuXHRcdFx0XHRpID0gbigxMCksXG5cdFx0XHRcdGMgPSBuKDExKSxcblx0XHRcdFx0dSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblx0XHRcdGUuZiA9IHJcblx0XHRcdFx0PyB1XG5cdFx0XHRcdDogZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdFx0XHRcdGlmICgoaSh0KSwgKGUgPSBjKGUsICEwKSksIGkobiksIG8pKVxuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB1KHQsIGUsIG4pO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoICh0KSB7fVxuXHRcdFx0XHRcdFx0aWYgKCdnZXQnIGluIG4gfHwgJ3NldCcgaW4gbilcblx0XHRcdFx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCcpO1xuXHRcdFx0XHRcdFx0cmV0dXJuICd2YWx1ZScgaW4gbiAmJiAodFtlXSA9IG4udmFsdWUpLCB0O1xuXHRcdFx0XHQgIH07XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0dmFyIHIgPSBuKDApLFxuXHRcdFx0XHRvID0gbigyKSxcblx0XHRcdFx0aSA9IG4oNyk7XG5cdFx0XHR0LmV4cG9ydHMgPVxuXHRcdFx0XHQhciAmJlxuXHRcdFx0XHQhbyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdDcgIT1cblx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpKCdkaXYnKSwgJ2EnLCB7XG5cdFx0XHRcdFx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiA3O1xuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSkuYVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbig4KSxcblx0XHRcdFx0byA9IG4oMSksXG5cdFx0XHRcdGkgPSByLmRvY3VtZW50LFxuXHRcdFx0XHRjID0gbyhpKSAmJiBvKGkuY3JlYXRlRWxlbWVudCk7XG5cdFx0XHR0LmV4cG9ydHMgPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHRyZXR1cm4gYyA/IGkuY3JlYXRlRWxlbWVudCh0KSA6IHt9O1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHQoZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0dmFyIG4gPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHRcdHJldHVybiB0ICYmIHQuTWF0aCA9PSBNYXRoICYmIHQ7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHQuZXhwb3J0cyA9XG5cdFx0XHRcdFx0bignb2JqZWN0JyA9PSB0eXBlb2YgZ2xvYmFsVGhpcyAmJiBnbG9iYWxUaGlzKSB8fFxuXHRcdFx0XHRcdG4oJ29iamVjdCcgPT0gdHlwZW9mIHdpbmRvdyAmJiB3aW5kb3cpIHx8XG5cdFx0XHRcdFx0bignb2JqZWN0JyA9PSB0eXBlb2Ygc2VsZiAmJiBzZWxmKSB8fFxuXHRcdFx0XHRcdG4oJ29iamVjdCcgPT0gdHlwZW9mIGUgJiYgZSkgfHxcblx0XHRcdFx0XHRGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHRcdFx0fS5jYWxsKHRoaXMsIG4oOSkpKTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlKSB7XG5cdFx0XHR2YXIgbjtcblx0XHRcdG4gPSAoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH0pKCk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRuID0gbiB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0XHRcdH0gY2F0Y2ggKHQpIHtcblx0XHRcdFx0J29iamVjdCcgPT0gdHlwZW9mIHdpbmRvdyAmJiAobiA9IHdpbmRvdyk7XG5cdFx0XHR9XG5cdFx0XHR0LmV4cG9ydHMgPSBuO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbigxKTtcblx0XHRcdHQuZXhwb3J0cyA9IGZ1bmN0aW9uICh0KSB7XG5cdFx0XHRcdGlmICghcih0KSkgdGhyb3cgVHlwZUVycm9yKFN0cmluZyh0KSArICcgaXMgbm90IGFuIG9iamVjdCcpO1xuXHRcdFx0XHRyZXR1cm4gdDtcblx0XHRcdH07XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0dmFyIHIgPSBuKDEpO1xuXHRcdFx0dC5leHBvcnRzID0gZnVuY3Rpb24gKHQsIGUpIHtcblx0XHRcdFx0aWYgKCFyKHQpKSByZXR1cm4gdDtcblx0XHRcdFx0dmFyIG4sIG87XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRlICYmXG5cdFx0XHRcdFx0J2Z1bmN0aW9uJyA9PSB0eXBlb2YgKG4gPSB0LnRvU3RyaW5nKSAmJlxuXHRcdFx0XHRcdCFyKChvID0gbi5jYWxsKHQpKSlcblx0XHRcdFx0KVxuXHRcdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0XHRpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgKG4gPSB0LnZhbHVlT2YpICYmICFyKChvID0gbi5jYWxsKHQpKSkpXG5cdFx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQhZSAmJlxuXHRcdFx0XHRcdCdmdW5jdGlvbicgPT0gdHlwZW9mIChuID0gdC50b1N0cmluZykgJiZcblx0XHRcdFx0XHQhcigobyA9IG4uY2FsbCh0KSkpXG5cdFx0XHRcdClcblx0XHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xuXHRcdFx0fTtcblx0XHR9LFxuXHRdKTtcbn07XG5cbmNvbnN0IHN0dWIgPSAoZnJhbWV3b3JrKSA9PiB7XG4gICAgaWYgKGZyYW1ld29yayA9PT0gJ3RjZnYyJylcbiAgICAgICAgc3R1Yl90Y2Z2MigpO1xuICAgIGVsc2VcbiAgICAgICAgc3R1Yl9jY3BhKCk7XG59O1xuXG5sZXQgcmVzb2x2ZVdpbGxTaG93UHJpdmFjeU1lc3NhZ2U7XG5jb25zdCB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlJDIgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHJlc29sdmVXaWxsU2hvd1ByaXZhY3lNZXNzYWdlID0gcmVzb2x2ZTtcbn0pO1xuY29uc3QgZ2V0UHJvcGVydHkgPSAoZnJhbWV3b3JrKSA9PiB7XG4gICAgaWYgKGZyYW1ld29yayA9PSAnYXVzJylcbiAgICAgICAgcmV0dXJuICdodHRwczovL2F1LnRoZWd1YXJkaWFuLmNvbSc7XG4gICAgcmV0dXJuIGlzR3VhcmRpYW5Eb21haW4oKSA/IG51bGwgOiAnaHR0cHM6Ly90ZXN0LnRoZWd1YXJkaWFuLmNvbSc7XG59O1xuY29uc3QgaW5pdCQyID0gKGZyYW1ld29yaywgcHViRGF0YSA9IHt9KSA9PiB7XG4gICAgc3R1YihmcmFtZXdvcmspO1xuICAgIGlmICh3aW5kb3cuX3NwXykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZXBvaW50IGdsb2JhbCAod2luZG93Ll9zcF8pIGlzIGFscmVhZHkgZGVmaW5lZCEnKTtcbiAgICB9XG4gICAgc2V0Q3VycmVudEZyYW1ld29yayhmcmFtZXdvcmspO1xuICAgIGludm9rZUNhbGxiYWNrcygpO1xuICAgIGNvbnN0IGZyYW1ld29ya01lc3NhZ2VUeXBlID0gZnJhbWV3b3JrID09ICd0Y2Z2MicgPyAnZ2RwcicgOiAnY2NwYSc7XG4gICAgbG9nKCdjbXAnLCBgZnJhbWV3b3JrOiAke2ZyYW1ld29ya31gKTtcbiAgICBsb2coJ2NtcCcsIGBmcmFtZXdvcmtNZXNzYWdlVHlwZTogJHtmcmFtZXdvcmtNZXNzYWdlVHlwZX1gKTtcbiAgICB3aW5kb3cuX3NwX3F1ZXVlID0gW107XG4gICAgd2luZG93Ll9zcF8gPSB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgYmFzZUVuZHBvaW50OiBFTkRQT0lOVCxcbiAgICAgICAgICAgIGFjY291bnRJZDogQUNDT1VOVF9JRCxcbiAgICAgICAgICAgIHByb3BlcnR5SHJlZjogZ2V0UHJvcGVydHkoZnJhbWV3b3JrKSxcbiAgICAgICAgICAgIHRhcmdldGluZ1BhcmFtczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29yayxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdWJEYXRhOiB7IC4uLnB1YkRhdGEsIGNtcEluaXRUaW1lVXRjOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSB9LFxuICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgb25Db25zZW50UmVhZHk6IChtZXNzYWdlX3R5cGUsIGNvbnNlbnRVVUlELCBldWNvbnNlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25Db25zZW50UmVhZHkgJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYGNvbnNlbnRVVUlEICR7Y29uc2VudFVVSUR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYGV1Y29uc2VudCAke2V1Y29uc2VudH1gKTtcbiAgICAgICAgICAgICAgICAgICAgbWFyaygnY21wLWdvdC1jb25zZW50Jyk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoaW52b2tlQ2FsbGJhY2tzLCAwKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uTWVzc2FnZVJlYWR5OiAobWVzc2FnZV90eXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uTWVzc2FnZVJlYWR5ICR7bWVzc2FnZV90eXBlfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZV90eXBlICE9IGZyYW1ld29ya01lc3NhZ2VUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBtYXJrKCdjbXAtdWktZGlzcGxheWVkJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbk1lc3NhZ2VSZWNlaXZlRGF0YTogKG1lc3NhZ2VfdHlwZSwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VSZWNlaXZlRGF0YSAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCAnb25NZXNzYWdlUmVjZWl2ZURhdGEgJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHZvaWQgcmVzb2x2ZVdpbGxTaG93UHJpdmFjeU1lc3NhZ2UoZGF0YS5tZXNzYWdlSWQgIT09IDApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25NZXNzYWdlQ2hvaWNlU2VsZWN0OiAobWVzc2FnZV90eXBlLCBjaG9pY2VfaWQsIGNob2ljZVR5cGVJRCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VDaG9pY2VTZWxlY3QgbWVzc2FnZV90eXBlOiAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25NZXNzYWdlQ2hvaWNlU2VsZWN0IGNob2ljZV9pZDogJHtjaG9pY2VfaWR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uTWVzc2FnZUNob2ljZVNlbGVjdCBjaG9pY2VfdHlwZV9pZDogJHtjaG9pY2VUeXBlSUR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9pY2VUeXBlSUQgPT09IDExIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2VUeXBlSUQgPT09IDEzIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2VUeXBlSUQgPT09IDE1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGludm9rZUNhbGxiYWNrcywgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUHJpdmFjeU1hbmFnZXJBY3Rpb246IGZ1bmN0aW9uIChtZXNzYWdlX3R5cGUsIHBtRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvblByaXZhY3lNYW5hZ2VyQWN0aW9uIG1lc3NhZ2VfdHlwZTogJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uUHJpdmFjeU1hbmFnZXJBY3Rpb24gJHtwbURhdGF9YCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbk1lc3NhZ2VDaG9pY2VFcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2VfdHlwZSwgZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uTWVzc2FnZUNob2ljZUVycm9yICR7bWVzc2FnZV90eXBlfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZV90eXBlICE9IGZyYW1ld29ya01lc3NhZ2VUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VDaG9pY2VFcnJvciAke2Vycn1gKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUE1DYW5jZWw6IGZ1bmN0aW9uIChtZXNzYWdlX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25QTUNhbmNlbCAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uU1BQTU9iamVjdFJlYWR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgJ29uU1BQTU9iamVjdFJlYWR5Jyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbiAobWVzc2FnZV90eXBlLCBlcnJvckNvZGUsIGVycm9yT2JqZWN0LCB1c2VyUmVzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgZXJyb3JDb2RlOiAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgZXJyb3JDb2RlOiAke2Vycm9yQ29kZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBlcnJvck9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYHVzZXJSZXNldDogJHt1c2VyUmVzZXR9YCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcbiAgICBpZiAoZnJhbWV3b3JrID09PSAndGNmdjInKSB7XG4gICAgICAgIHdpbmRvdy5fc3BfLmNvbmZpZy5nZHByID0ge1xuICAgICAgICAgICAgdGFyZ2V0aW5nUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHdpbmRvdy5fc3BfLmNvbmZpZy5jY3BhID0ge1xuICAgICAgICAgICAgdGFyZ2V0aW5nUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qgc3BMaWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzcExpYi5pZCA9ICdzb3VyY2Vwb2ludC1saWInO1xuICAgIHNwTGliLnNyYyA9IGAke0VORFBPSU5UfS91bmlmaWVkL3dyYXBwZXJNZXNzYWdpbmdXaXRob3V0RGV0ZWN0aW9uLmpzYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNwTGliKTtcbn07XG5cbmNvbnN0IGluaXQkMSA9IChmcmFtZXdvcmssIHB1YkRhdGEpID0+IHtcbiAgICBtYXJrKCdjbXAtaW5pdCcpO1xuICAgIGluaXQkMihmcmFtZXdvcmssIHB1YkRhdGEpO1xufTtcbmNvbnN0IHdpbGxTaG93UHJpdmFjeU1lc3NhZ2UkMSA9ICgpID0+IHdpbGxTaG93UHJpdmFjeU1lc3NhZ2UkMjtcbmZ1bmN0aW9uIHNob3dQcml2YWN5TWFuYWdlciQxKCkge1xuICAgIHN3aXRjaCAoZ2V0Q3VycmVudEZyYW1ld29yaygpKSB7XG4gICAgICAgIGNhc2UgJ3RjZnYyJzpcbiAgICAgICAgICAgIHdpbmRvdy5fc3BfPy5nZHByPy5sb2FkUHJpdmFjeU1hbmFnZXJNb2RhbD8uKFBSSVZBQ1lfTUFOQUdFUl9UQ0ZWMik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2NwYSc6XG4gICAgICAgICAgICB3aW5kb3cuX3NwXz8uY2NwYT8ubG9hZFByaXZhY3lNYW5hZ2VyTW9kYWw/LihQUklWQUNZX01BTkFHRVJfQ0NQQSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYXVzJzpcbiAgICAgICAgICAgIHdpbmRvdy5fc3BfPy5jY3BhPy5sb2FkUHJpdmFjeU1hbmFnZXJNb2RhbD8uKFBSSVZBQ1lfTUFOQUdFUl9BVVNUUkFMSUEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuY29uc3QgQ01QID0ge1xuICAgIGluaXQ6IGluaXQkMSxcbiAgICB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlOiB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlJDEsXG4gICAgc2hvd1ByaXZhY3lNYW5hZ2VyOiBzaG93UHJpdmFjeU1hbmFnZXIkMSxcbn07XG5cbmNvbnN0IENPT0tJRV9OQU1FID0gJ2d1LWNtcC1kaXNhYmxlZCc7XG5jb25zdCBkaXNhYmxlID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmNvb2tpZSA9IGAke0NPT0tJRV9OQU1FfT10cnVlYDtcbn07XG5jb25zdCBlbmFibGUgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuY29va2llID0gYCR7Q09PS0lFX05BTUV9PWZhbHNlYDtcbn07XG5jb25zdCBpc0Rpc2FibGVkID0gKCkgPT4gbmV3IFJlZ0V4cChgJHtDT09LSUVfTkFNRX09dHJ1ZShcXFxcVyt8JClgKS50ZXN0KGRvY3VtZW50LmNvb2tpZSk7XG5cbmNvbnN0IFZlbmRvcklEcyA9IHtcbiAgICBhOTogWyc1ZjM2OWEwMmI4ZTA1YzMwODcwMWY4MjknXSxcbiAgICBhY2FzdDogWyc1ZjIwM2RjYjFmMGRlYTc5MDU2MmUyMGYnXSxcbiAgICBicmF6ZTogWyc1ZWQ4YzQ5YzRiOGNlNDU3MWM3YWQ4MDEnXSxcbiAgICBjb21zY29yZTogWyc1ZWZlZmUyNWI4ZTA1YzA2NTQyYjJhNzcnXSxcbiAgICBmYjogWyc1ZTdlMTI5OGI4ZTA1YzU0YTg1YzUyZDInXSxcbiAgICAnZ29vZ2xlLWFuYWx5dGljcyc6IFsnNWU1NDJiM2E0Y2Q4ODg0ZWI0MWI1YTcyJ10sXG4gICAgJ2dvb2dsZS1tb2JpbGUtYWRzJzogWyc1ZjFhYWRhNmI4ZTA1YzMwNmMwNTk3ZDcnXSxcbiAgICAnZ29vZ2xlLXRhZy1tYW5hZ2VyJzogWyc1ZTk1MmY2MTA3ZDlkMjBjODhlN2M5NzUnXSxcbiAgICBnb29nbGV0YWc6IFsnNWYxYWFkYTZiOGUwNWMzMDZjMDU5N2Q3J10sXG4gICAgaWFzOiBbJzVlN2NlZDU3YjhlMDVjNDg1MjQ2Y2NmMyddLFxuICAgIGluaXppbzogWyc1ZTM3ZmMzZTU2YTVlNjYxNTUwMmY5YzknXSxcbiAgICBpcHNvczogWyc1Zjc0NWFiOTZmM2FhZTAxNjM3NDA0MDknXSxcbiAgICBsaW5rZWRpbjogWyc1ZjJkMjJhNmI4ZTA1YzAyYWEyODNiM2MnXSxcbiAgICBsb3RhbWU6IFsnNWVkNmFlYjFiOGUwNWMyNDFhNjNjNzFmJ10sXG4gICAgbmllbHNlbjogWyc1ZWY1YzNhNWI4ZTA1YzY5OTgwZWFhNWInXSxcbiAgICBvcGhhbjogWyc1ZjIwM2RiZWVhYWFhODc2OGZkMzIyNmEnXSxcbiAgICBwZXJtdXRpdmU6IFsnNWVmZjBkNzc5NjliZmEwMzc0NjQyN2ViJ10sXG4gICAgcHJlYmlkOiBbJzVmOTJhNjJhYTIyODYzNjg1ZjRkYWE0YyddLFxuICAgIHJlZHBsYW5ldDogWyc1ZjE5OWMzMDI0MjVhMzNmM2YwOTBmNTEnXSxcbiAgICByZW1hcmtldGluZzogWyc1ZWQwZWI2ODhhNzY1MDNmMTAxNjU3OGYnXSxcbiAgICBzZW50cnk6IFsnNWYwZjM5MDE0ZWZmZGE2ZThiYmQyMDA2J10sXG4gICAgdGVhZHM6IFsnNWVhYjNkNWFiOGUwNWMyYmJlMzNmMzk5J10sXG4gICAgdHdpdHRlcjogWyc1ZTcxNzYwYjY5OTY2NTQwZTQ1NTRmMDEnXSxcbiAgICAneW91dHViZS1wbGF5ZXInOiBbJzVlN2FjM2ZhZTMwZTdkMWJjMWViZjVlOCddLFxufTtcblxuY29uc3QgZ2V0Q29uc2VudEZvciQxID0gKHZlbmRvciwgY29uc2VudCkgPT4ge1xuICAgIGNvbnN0IHNvdXJjZXBvaW50SWRzID0gVmVuZG9ySURzW3ZlbmRvcl07XG4gICAgaWYgKHR5cGVvZiBzb3VyY2Vwb2ludElkcyA9PT0gJ3VuZGVmaW5lZCcgfHwgc291cmNlcG9pbnRJZHMgPT09IFtdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVmVuZG9yICcke3ZlbmRvcn0nIG5vdCBmb3VuZCwgb3Igd2l0aCBubyBTb3VyY2Vwb2ludCBJRC4gYCArXG4gICAgICAgICAgICAnSWYgaXQgc2hvdWxkIGJlIGFkZGVkLCByYWlzZSBhbiBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vZ3VhcmRpYW4vY29uc2VudC1tYW5hZ2VtZW50LXBsYXRmb3JtL2lzc3VlcycpO1xuICAgIH1cbiAgICBpZiAoY29uc2VudC5jY3BhKSB7XG4gICAgICAgIHJldHVybiAhY29uc2VudC5jY3BhLmRvTm90U2VsbDtcbiAgICB9XG4gICAgaWYgKGNvbnNlbnQuYXVzKSB7XG4gICAgICAgIHJldHVybiBjb25zZW50LmF1cy5wZXJzb25hbGlzZWRBZHZlcnRpc2luZztcbiAgICB9XG4gICAgY29uc3QgZm91bmRTb3VyY2Vwb2ludElkID0gc291cmNlcG9pbnRJZHMuZmluZCgoaWQpID0+IHR5cGVvZiBjb25zZW50LnRjZnYyPy52ZW5kb3JDb25zZW50c1tpZF0gIT09ICd1bmRlZmluZWQnKTtcbiAgICBpZiAodHlwZW9mIGZvdW5kU291cmNlcG9pbnRJZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBObyBjb25zZW50IHJldHVybmVkIGZyb20gU291cmNlcG9pbnQgZm9yIHZlbmRvcjogJyR7dmVuZG9yfSdgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB0Y2Z2MkNvbnNlbnQgPSBjb25zZW50LnRjZnYyPy52ZW5kb3JDb25zZW50c1tmb3VuZFNvdXJjZXBvaW50SWRdO1xuICAgIGlmICh0eXBlb2YgdGNmdjJDb25zZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oYE5vIGNvbnNlbnQgcmV0dXJuZWQgZnJvbSBTb3VyY2Vwb2ludCBmb3IgdmVuZG9yOiAnJHt2ZW5kb3J9J2ApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0Y2Z2MkNvbnNlbnQ7XG59O1xuXG5jb25zdCBnZXRGcmFtZXdvcmsgPSAoY291bnRyeUNvZGUpID0+IHtcbiAgICBsZXQgZnJhbWV3b3JrO1xuICAgIHN3aXRjaCAoY291bnRyeUNvZGUpIHtcbiAgICAgICAgY2FzZSAnVVMnOlxuICAgICAgICAgICAgZnJhbWV3b3JrID0gJ2NjcGEnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0FVJzpcbiAgICAgICAgICAgIGZyYW1ld29yayA9ICdhdXMnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0dCJzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGZyYW1ld29yayA9ICd0Y2Z2Mic7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1ld29yaztcbn07XG5cbmNvbnN0IG9uQ29uc2VudCQxID0gKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIG9uQ29uc2VudENoYW5nZSQxKChjb25zZW50U3RhdGUpID0+IHtcbiAgICAgICAgaWYgKGNvbnNlbnRTdGF0ZS50Y2Z2MiB8fCBjb25zZW50U3RhdGUuY2NwYSB8fCBjb25zZW50U3RhdGUuYXVzKSB7XG4gICAgICAgICAgICByZXNvbHZlKGNvbnNlbnRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KCdVbmtub3duIGZyYW1ld29yaycpO1xuICAgIH0pO1xufSk7XG5cbnZhciBfYSwgX2IsIF9jLCBfZDtcbmlmICghaXNTZXJ2ZXJTaWRlKSB7XG4gICAgd2luZG93Lmd1Q21wSG90Rml4IHx8ICh3aW5kb3cuZ3VDbXBIb3RGaXggPSB7fSk7XG59XG5sZXQgX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2U7XG5sZXQgaW5pdENvbXBsZXRlID0gZmFsc2U7XG5sZXQgcmVzb2x2ZUluaXRpYWxpc2VkO1xuY29uc3QgaW5pdGlhbGlzZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHJlc29sdmVJbml0aWFsaXNlZCA9IHJlc29sdmU7XG59KTtcbmNvbnN0IGluaXQgPSAoeyBwdWJEYXRhLCBjb3VudHJ5IH0pID0+IHtcbiAgICBpZiAoaXNEaXNhYmxlZCgpIHx8IGlzU2VydmVyU2lkZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmICh3aW5kb3cuZ3VDbXBIb3RGaXguaW5pdGlhbGlzZWQpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5ndUNtcEhvdEZpeC5jbXA/LnZlcnNpb24gIT09IFwiMC4wLjAtdGhpcy1uZXZlci11cGRhdGVzLWluLXNvdXJjZS1jb2RlLXJlZmVyLXRvLWdpdC10YWdzXCIpXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1R3byBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIENNUCBhcmUgcnVubmluZzonLCBbXG4gICAgICAgICAgICAgICAgXCIwLjAuMC10aGlzLW5ldmVyLXVwZGF0ZXMtaW4tc291cmNlLWNvZGUtcmVmZXItdG8tZ2l0LXRhZ3NcIixcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ3VDbXBIb3RGaXguY21wPy52ZXJzaW9uLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2luZG93Lmd1Q21wSG90Rml4LmluaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICBpZiAodHlwZW9mIGNvdW50cnkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ01QIGluaXRpYWxpc2VkIHdpdGhvdXQgYGNvdW50cnlgIHByb3BlcnR5LiBBIDItbGV0dGVyLCBJU08gSVNPXzMxNjYtMSBjb3VudHJ5IGNvZGUgaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGZyYW1ld29yayA9IGdldEZyYW1ld29yayhjb3VudHJ5KTtcbiAgICBDTVAuaW5pdChmcmFtZXdvcmssIHB1YkRhdGEgPz8ge30pO1xuICAgIHZvaWQgQ01QLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UoKS50aGVuKCh3aWxsU2hvd1ZhbHVlKSA9PiB7XG4gICAgICAgIF93aWxsU2hvd1ByaXZhY3lNZXNzYWdlID0gd2lsbFNob3dWYWx1ZTtcbiAgICAgICAgaW5pdENvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgbG9nKCdjbXAnLCAnaW5pdENvbXBsZXRlJyk7XG4gICAgfSk7XG4gICAgcmVzb2x2ZUluaXRpYWxpc2VkKCk7XG59O1xuY29uc3Qgd2lsbFNob3dQcml2YWN5TWVzc2FnZSA9ICgpID0+IGluaXRpYWxpc2VkLnRoZW4oKCkgPT4gQ01QLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UoKSk7XG5jb25zdCB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlU3luYyA9ICgpID0+IHtcbiAgICBpZiAoX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2U7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignQ01QIGhhcyBub3QgYmVlbiBpbml0aWFsaXNlZC4gVXNlIHRoZSBhc3luYyB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlKCkgaW5zdGVhZC4nKTtcbn07XG5jb25zdCBoYXNJbml0aWFsaXNlZCA9ICgpID0+IGluaXRDb21wbGV0ZTtcbmNvbnN0IHNob3dQcml2YWN5TWFuYWdlciA9ICgpID0+IHtcbiAgICB2b2lkIGluaXRpYWxpc2VkLnRoZW4oQ01QLnNob3dQcml2YWN5TWFuYWdlcik7XG59O1xuY29uc3QgY21wID0gaXNTZXJ2ZXJTaWRlXG4gICAgPyBjbXAkMVxuICAgIDogKChfYSA9IHdpbmRvdy5ndUNtcEhvdEZpeCkuY21wIHx8IChfYS5jbXAgPSB7XG4gICAgICAgIGluaXQsXG4gICAgICAgIHdpbGxTaG93UHJpdmFjeU1lc3NhZ2UsXG4gICAgICAgIHdpbGxTaG93UHJpdmFjeU1lc3NhZ2VTeW5jLFxuICAgICAgICBoYXNJbml0aWFsaXNlZCxcbiAgICAgICAgc2hvd1ByaXZhY3lNYW5hZ2VyLFxuICAgICAgICB2ZXJzaW9uOiBcIjAuMC4wLXRoaXMtbmV2ZXItdXBkYXRlcy1pbi1zb3VyY2UtY29kZS1yZWZlci10by1naXQtdGFnc1wiLFxuICAgICAgICBfX2lzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgIF9fZW5hYmxlOiBlbmFibGUsXG4gICAgICAgIF9fZGlzYWJsZTogZGlzYWJsZSxcbiAgICB9KSk7XG5jb25zdCBvbkNvbnNlbnQgPSBpc1NlcnZlclNpZGVcbiAgICA/IG9uQ29uc2VudCQyXG4gICAgOiAoKF9iID0gd2luZG93Lmd1Q21wSG90Rml4KS5vbkNvbnNlbnQgfHwgKF9iLm9uQ29uc2VudCA9IG9uQ29uc2VudCQxKSk7XG5jb25zdCBvbkNvbnNlbnRDaGFuZ2UgPSBpc1NlcnZlclNpZGVcbiAgICA/IG9uQ29uc2VudENoYW5nZSQyXG4gICAgOiAoKF9jID0gd2luZG93Lmd1Q21wSG90Rml4KS5vbkNvbnNlbnRDaGFuZ2UgfHwgKF9jLm9uQ29uc2VudENoYW5nZSA9IG9uQ29uc2VudENoYW5nZSQxKSk7XG5jb25zdCBnZXRDb25zZW50Rm9yID0gaXNTZXJ2ZXJTaWRlXG4gICAgPyBnZXRDb25zZW50Rm9yJDJcbiAgICA6ICgoX2QgPSB3aW5kb3cuZ3VDbXBIb3RGaXgpLmdldENvbnNlbnRGb3IgfHwgKF9kLmdldENvbnNlbnRGb3IgPSBnZXRDb25zZW50Rm9yJDEpKTtcblxuZXhwb3J0IHsgY21wLCBnZXRDb25zZW50Rm9yLCBvbkNvbnNlbnQsIG9uQ29uc2VudENoYW5nZSB9O1xuIiwidmFyIF9fY2xhc3NQcml2YXRlRmllbGRTZXQgPSAodGhpcyAmJiB0aGlzLl9fY2xhc3NQcml2YXRlRmllbGRTZXQpIHx8IGZ1bmN0aW9uIChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xufTtcbnZhciBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0ID0gKHRoaXMgJiYgdGhpcy5fX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KSB8fCBmdW5jdGlvbiAocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XG59O1xudmFyIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBfbG9jYWwsIF9zZXNzaW9uLCBfYTtcbmNsYXNzIFN0b3JhZ2VGYWN0b3J5IHtcbiAgICBjb25zdHJ1Y3RvcihzdG9yYWdlKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0NsYXNzZXMvUHJpdmF0ZV9jbGFzc19maWVsZHNcbiAgICAgICAgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2Uuc2V0KHRoaXMsIHZvaWQgMCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1aWQgPSBuZXcgRGF0ZSgpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldEl0ZW0odWlkLCB1aWQpO1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlID0gc3RvcmFnZS5nZXRJdGVtKHVpZCkgPT0gdWlkO1xuICAgICAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKHVpZCk7XG4gICAgICAgICAgICBpZiAoYXZhaWxhYmxlKVxuICAgICAgICAgICAgICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIHN0b3JhZ2UsIFwiZlwiKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIHdoZXRoZXIgc3RvcmFnZSBpcyBhdmFpbGFibGUuXG4gICAgICovXG4gICAgaXNBdmFpbGFibGUoKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKSk7XG4gICAgfVxuICAgIC8qIGVzbGludC1kaXNhYmxlXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXNzaWdubWVudCxcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1yZXR1cm4sXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgLS1cbiAgICAgICAgLSB3ZSdyZSB1c2luZyB0aGUgYHRyeWAgdG8gaGFuZGxlIGFueXRoaW5nIGJhZCBoYXBwZW5pbmdcbiAgICAgICAgLSBKU09OLnBhcnNlIHJldHVybnMgYW4gYGFueWAsIHdlIHJlYWxseSBhcmUgcmV0dXJuaW5nIGFuIGBhbnlgXG4gICAgKi9cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhbiBpdGVtIGZyb20gc3RvcmFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqL1xuICAgIGdldChrZXkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdmFsdWUsIGV4cGlyZXMgfSA9IEpTT04ucGFyc2UoX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5nZXRJdGVtKGtleSkgPz8gJycpO1xuICAgICAgICAgICAgLy8gaXMgdGhpcyBpdGVtIGhhcyBwYXNzZWQgaXRzIHNlbGwtYnktZGF0ZSwgcmVtb3ZlIGl0XG4gICAgICAgICAgICBpZiAoZXhwaXJlcyAmJiBuZXcgRGF0ZSgpID4gbmV3IERhdGUoZXhwaXJlcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZShrZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXNzaWdubWVudCxcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1yZXR1cm4sXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAqL1xuICAgIC8qKlxuICAgICAqIFNhdmUgYSB2YWx1ZSB0byBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICogQHBhcmFtIHZhbHVlIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICAgICAqIEBwYXJhbSBleHBpcmVzIC0gb3B0aW9uYWwgZGF0ZSBvbiB3aGljaCB0aGlzIGRhdGEgd2lsbCBleHBpcmVcbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSwgZXhwaXJlcykge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBleHBpcmVzLFxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbiBpdGVtIGZyb20gc3RvcmFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqL1xuICAgIHJlbW92ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8ucmVtb3ZlSXRlbShrZXkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBpdGVtcyBmcm9tIHN0b3JhZ2UuXG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LmNsZWFyKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGFuIGl0ZW0gZnJvbSBzdG9yYWdlIGluIGl0cyByYXcgc3RhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKi9cbiAgICBnZXRSYXcoa2V5KSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LmdldEl0ZW0oa2V5KSA/PyBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTYXZlIGEgcmF3IHZhbHVlIHRvIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgZGF0YSB0byBzYXZlXG4gICAgICovXG4gICAgc2V0UmF3KGtleSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uc2V0SXRlbShrZXksIHZhbHVlKTtcbiAgICB9XG59XG5fU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIE1hbmFnZXMgdXNpbmcgYGxvY2FsU3RvcmFnZWAgYW5kIGBzZXNzaW9uU3RvcmFnZWAuXG4gKlxuICogSGFzIGEgZmV3IGFkdmFudGFnZXMgb3ZlciB0aGUgbmF0aXZlIEFQSSwgaW5jbHVkaW5nXG4gKiAtIGZhaWxpbmcgZ3JhY2VmdWxseSBpZiBzdG9yYWdlIGlzIG5vdCBhdmFpbGFibGVcbiAqIC0geW91IGNhbiBzYXZlIGFuZCByZXRyaWV2ZSBhbnkgSlNPTmFibGUgZGF0YVxuICpcbiAqIEFsbCBtZXRob2RzIGFyZSBhdmFpbGFibGUgZm9yIGJvdGggYGxvY2FsU3RvcmFnZWAgYW5kIGBzZXNzaW9uU3RvcmFnZWAuXG4gKi9cbmV4cG9ydCBjb25zdCBzdG9yYWdlID0gbmV3IChfYSA9IGNsYXNzIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBfbG9jYWwuc2V0KHRoaXMsIHZvaWQgMCk7XG4gICAgICAgICAgICBfc2Vzc2lvbi5zZXQodGhpcywgdm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjcmVhdGluZyB0aGUgaW5zdGFuY2UgcmVxdWlyZXMgdGVzdGluZyB0aGUgbmF0aXZlIGltcGxlbWVudGF0aW9uXG4gICAgICAgIC8vIHdoaWNoIGlzIGJsb2NraW5nLiB0aGVyZWZvcmUsIG9ubHkgY3JlYXRlIG5ldyBpbnN0YW5jZXMgb2YgdGhlIGZhY3RvcnlcbiAgICAgICAgLy8gd2hlbiBpdCdzIGFjY2Vzc2VkIGkuZS4gd2Uga25vdyB3ZSdyZSBnb2luZyB0byB1c2UgaXRcbiAgICAgICAgZ2V0IGxvY2FsKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHRoaXMsIF9sb2NhbCwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfbG9jYWwsIFwiZlwiKSB8fCBuZXcgU3RvcmFnZUZhY3RvcnkobG9jYWxTdG9yYWdlKSwgXCJmXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgc2Vzc2lvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAoX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfc2Vzc2lvbiwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfc2Vzc2lvbiwgXCJmXCIpIHx8IG5ldyBTdG9yYWdlRmFjdG9yeShzZXNzaW9uU3RvcmFnZSksIFwiZlwiKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9sb2NhbCA9IG5ldyBXZWFrTWFwKCksXG4gICAgX3Nlc3Npb24gPSBuZXcgV2Vha01hcCgpLFxuICAgIF9hKSgpO1xuIiwiLyoqXG4gKiBZb3UgY2FuIG9ubHkgc3Vic2NyaWJlIHRvIHRlYW1zIGZyb20gdGhpcyBsaXN0LlxuICogQWRkIHlvdXIgdGVhbSBuYW1lIGJlbG93IHRvIHN0YXJ0IGxvZ2dpbmcuXG4gKlxuICogTWFrZSBzdXJlIHlvdXIgbGFiZWwgaGFzIGEgY29udHJhc3QgcmF0aW8gb2YgNC41IG9yIG1vcmUuXG4gKiAqL1xuZXhwb3J0IGNvbnN0IHRlYW1zID0ge1xuICAgIGNvbW1vbjoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzA1Mjk2MicsXG4gICAgICAgIGZvbnQ6ICcjZmZmZmZmJyxcbiAgICB9LFxuICAgIGNvbW1lcmNpYWw6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyM3N0VFQUEnLFxuICAgICAgICBmb250OiAnIzAwNDQwMCcsXG4gICAgfSxcbiAgICBjbXA6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGRjZCQjUnLFxuICAgICAgICBmb250OiAnIzJGMDQwNCcsXG4gICAgfSxcbiAgICBkb3Rjb206IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMwMDAwMDAnLFxuICAgICAgICBmb250OiAnI2ZmNzMwMCcsXG4gICAgfSxcbiAgICBkZXNpZ246IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMxODVFMzYnLFxuICAgICAgICBmb250OiAnI0ZGRjRGMicsXG4gICAgfSxcbiAgICB0eDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzJGNEY0RicsXG4gICAgICAgIGZvbnQ6ICcjRkZGRkZGJyxcbiAgICB9LFxufTtcbiIsIi8qKlxuICpcbiAqIEhhbmRsZXMgdGVhbS1iYXNlZCBsb2dnaW5nIHRvIHRoZSBicm93c2VyIGNvbnNvbGVcbiAqXG4gKiBQcmV2ZW50cyBhIHByb2xpZmVyYXRpb24gb2YgY29uc29sZS5sb2cgaW4gY2xpZW50LXNpZGVcbiAqIGNvZGUuXG4gKlxuICogU3Vic2NyaWJpbmcgdG8gbG9ncyByZWxpZXMgb24gTG9jYWxTdG9yYWdlXG4gKi9cbnZhciBfYTtcbmltcG9ydCB7IHRlYW1zIH0gZnJvbSAnLi9sb2dnZXIudGVhbXMnO1xuaW1wb3J0IHsgc3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZSc7XG5jb25zdCBLRVkgPSAnZ3UubG9nZ2VyJztcbmNvbnN0IHRlYW1Db2xvdXJzID0gdGVhbXM7XG5jb25zdCBzdHlsZSA9ICh0ZWFtKSA9PiB7XG4gICAgY29uc3QgeyBiYWNrZ3JvdW5kLCBmb250IH0gPSB0ZWFtQ29sb3Vyc1t0ZWFtXTtcbiAgICByZXR1cm4gYGJhY2tncm91bmQ6ICR7YmFja2dyb3VuZH07IGNvbG9yOiAke2ZvbnR9OyBwYWRkaW5nOiAycHggM3B4OyBib3JkZXItcmFkaXVzOjNweGA7XG59O1xuLyoqXG4gKiBPbmx5IGxvZ3MgaW4gZGV2IGVudmlyb25tZW50cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gKHRlYW0sIC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBpc0RldkVudiA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0LmluY2x1ZGVzKCdsb2NhbGhvc3QnKSB8fFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaG9zdC5lbmRzV2l0aCgndGhlZ3Vsb2NhbC5jb20nKSB8fFxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaG9zdC5lbmRzV2l0aCgnLmRldi10aGVndWFyZGlhbi5jb20nKTtcbiAgICBpZiAoaXNEZXZFbnYpXG4gICAgICAgIGxvZyh0ZWFtLCAuLi5hcmdzKTtcbn07XG4vKipcbiAqIFJ1bnMgaW4gYWxsIGVudmlyb25tZW50cywgaWYgbG9jYWwgc3RvcmFnZSB2YWx1ZXMgYXJlIHNldC5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvZyA9ICh0ZWFtLCAuLi5hcmdzKSA9PiB7XG4gICAgLy8gVE9ETyBhZGQgY2hlY2sgZm9yIGxvY2FsU3RvcmFnZVxuICAgIGlmICghKHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSkgfHwgJycpLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgc3R5bGVzID0gW3N0eWxlKCdjb21tb24nKSwgJycsIHN0eWxlKHRlYW0pLCAnJ107XG4gICAgY29uc29sZS5sb2coYCVjQGd1YXJkaWFuJWMgJWMke3RlYW19JWNgLCAuLi5zdHlsZXMsIC4uLmFyZ3MpO1xufTtcbi8qKlxuICogU3Vic2NyaWJlIHRvIGEgdGVhbeKAmXMgbG9nXG4gKiBAcGFyYW0gdGVhbSB0aGUgdGVhbeKAmXMgdW5pcXVlIElEXG4gKi9cbmNvbnN0IHN1YnNjcmliZVRvID0gKHRlYW0pID0+IHtcbiAgICBjb25zdCB0ZWFtU3Vic2NyaXB0aW9ucyA9IHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSlcbiAgICAgICAgPyBzdG9yYWdlLmxvY2FsLmdldChLRVkpLnNwbGl0KCcsJylcbiAgICAgICAgOiBbXTtcbiAgICBpZiAoIXRlYW1TdWJzY3JpcHRpb25zLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICB0ZWFtU3Vic2NyaXB0aW9ucy5wdXNoKHRlYW0pO1xuICAgIHN0b3JhZ2UubG9jYWwuc2V0KEtFWSwgdGVhbVN1YnNjcmlwdGlvbnMuam9pbignLCcpKTtcbiAgICBsb2codGVhbSwgJ/CflJQgU3Vic2NyaWJlZCwgaGVsbG8hJyk7XG59O1xuLyoqXG4gKiBVbnN1YnNjcmliZSB0byBhIHRlYW3igJlzIGxvZ1xuICogQHBhcmFtIHRlYW0gdGhlIHRlYW3igJlzIHVuaXF1ZSBJRFxuICovXG5jb25zdCB1bnN1YnNjcmliZUZyb20gPSAodGVhbSkgPT4ge1xuICAgIGxvZyh0ZWFtLCAn8J+UlSBVbnN1YnNjcmliZWQsIGdvb2QtYnllIScpO1xuICAgIGNvbnN0IHRlYW1TdWJzY3JpcHRpb25zID0gc3RvcmFnZS5sb2NhbC5nZXQoS0VZKVxuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAuZmlsdGVyKCh0KSA9PiB0ICE9PSB0ZWFtKTtcbiAgICBzdG9yYWdlLmxvY2FsLnNldChLRVksIHRlYW1TdWJzY3JpcHRpb25zLmpvaW4oJywnKSk7XG59O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5ndWFyZGlhbiB8fCAod2luZG93Lmd1YXJkaWFuID0ge30pO1xuICAgIChfYSA9IHdpbmRvdy5ndWFyZGlhbikubG9nZ2VyIHx8IChfYS5sb2dnZXIgPSB7XG4gICAgICAgIHN1YnNjcmliZVRvLFxuICAgICAgICB1bnN1YnNjcmliZUZyb20sXG4gICAgICAgIHRlYW1zOiAoKSA9PiBPYmplY3Qua2V5cyh0ZWFtQ29sb3VycyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgXyA9IHtcbiAgICB0ZWFtQ29sb3VycyxcbiAgICBLRVksXG59O1xuIiwiPHNjcmlwdD5cblx0Ly8gYWx3YXlzIHVzZSB0aGUgZGlzdCB2ZXJzaW9uXG5cdGltcG9ydCB7IGNtcCwgb25Db25zZW50Q2hhbmdlIH0gZnJvbSAnLi4vJztcblx0aW1wb3J0IHsgbG9nIH0gZnJvbSAnQGd1YXJkaWFuL2xpYnMnO1xuXHRpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcblxuXHRzd2l0Y2ggKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG5cdFx0Y2FzZSAnI3RjZnYyJzpcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmcmFtZXdvcmsnLCBKU09OLnN0cmluZ2lmeSgndGNmdjInKSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcjY2NwYSc6XG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZnJhbWV3b3JrJywgSlNPTi5zdHJpbmdpZnkoJ2NjcGEnKSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlICcjYXVzJzpcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmcmFtZXdvcmsnLCBKU09OLnN0cmluZ2lmeSgnYXVzJykpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJ3RjZnYyJztcblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmcmFtZXdvcmsnLCBKU09OLnN0cmluZ2lmeSgndGNmdjInKSk7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHdpbmRvdy5ndWFyZGlhbi5sb2dnZXIuc3Vic2NyaWJlVG8oXCJjbXBcIilcblxuXHQvLyBhbGxvdyB1cyB0byBsaXN0ZW4gdG8gY2hhbmdlcyBvbiB3aW5kb3cuZ3VDbXBIb3RGaXhcblx0d2luZG93Lmd1Q21wSG90Rml4ID0gbmV3IFByb3h5KHdpbmRvdy5ndUNtcEhvdEZpeCwge1xuXHRcdHNldDogZnVuY3Rpb24gKHRhcmdldCwga2V5LCB2YWx1ZSkge1xuXHRcdFx0dGFyZ2V0W2tleV0gPSB2YWx1ZTtcblx0XHRcdGNvbnNvbGUuaW5mbygnJWN3aW5kb3cuZ3VDbXBIb3RGaXgnLCAnY29sb3I6IGRlZXBwaW5rOycsIHtcblx0XHRcdFx0Li4ud2luZG93Lmd1Q21wSG90Rml4LFxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXHR9KTtcblxuXHRmdW5jdGlvbiBsb2dFdmVudChldmVudCkge1xuXHRcdGV2ZW50c0xpc3QgPSBbLi4uZXZlbnRzTGlzdCwgZXZlbnRdO1xuXHRcdGxvZygnY21wJywgZXZlbnQpO1xuXHR9XG5cblx0bGV0IGNsZWFyUHJlZmVyZW5jZXMgPSAoKSA9PiB7XG5cdFx0Ly8gY2xlYXIgbG9jYWwgc3RvcmFnZVxuXHRcdC8vIGh0dHBzOi8vZG9jdW1lbnRhdGlvbi5zb3VyY2Vwb2ludC5jb20vd2ViLWltcGxlbWVudGF0aW9uL2dlbmVyYWwvY29va2llcy1hbmQtbG9jYWwtc3RvcmFnZSNjbXAtbG9jYWwtc3RvcmFnZVxuXHRcdGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuXG5cdFx0Ly8gY2xlYXIgY29va2llc1xuXHRcdC8vIGh0dHBzOi8vZG9jdW1lbnRhdGlvbi5zb3VyY2Vwb2ludC5jb20vd2ViLWltcGxlbWVudGF0aW9uL2dlbmVyYWwvY29va2llcy1hbmQtbG9jYWwtc3RvcmFnZSNjbXAtY29va2llc1xuXHRcdGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpLmZvckVhY2goKGNvb2tpZSkgPT4ge1xuXHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llXG5cdFx0XHRcdC5yZXBsYWNlKC9eICsvLCAnJylcblx0XHRcdFx0LnJlcGxhY2UoLz0uKi8sIGA9O2V4cGlyZXM9JHtuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCl9O3BhdGg9L2ApO1xuXHRcdH0pO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0fTtcblxuXHRsZXQgZnJhbWV3b3JrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZnJhbWV3b3JrJykpO1xuXG5cdGxldCBzZXRMb2NhdGlvbiA9ICgpID0+IHtcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZnJhbWV3b3JrJywgSlNPTi5zdHJpbmdpZnkoZnJhbWV3b3JrKSk7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBmcmFtZXdvcms7XG5cdFx0Y2xlYXJQcmVmZXJlbmNlcygpO1xuXHR9O1xuXG5cdCQ6IGNvbnNlbnRTdGF0ZSA9IHt9O1xuXHQkOiBldmVudHNMaXN0ID0gW107XG5cblx0Y21wLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UoKS50aGVuKCh3aWxsU2hvdykgPT4ge1xuXHRcdGxvZ0V2ZW50KHsgdGl0bGU6ICdjbXAud2lsbFNob3dQcml2YWN5TWVzc2FnZScsIHBheWxvYWQ6IHdpbGxTaG93IH0pO1xuXHR9KTtcblxuXHRvbkNvbnNlbnRDaGFuZ2UoKHBheWxvYWQpID0+IHtcblx0XHRsb2dFdmVudCh7IHRpdGxlOiAnb25Db25zZW50Q2hhbmdlJywgcGF5bG9hZCB9KTtcblx0XHRjb25zZW50U3RhdGUgPSBwYXlsb2FkO1xuXHR9KTtcblxuXHRvbk1vdW50KGFzeW5jICgpID0+IHtcblx0XHQvLyBTZXQgdGhlIGNvdW50cnkgYmFzZWQgb24gY2hvc2VuIGZyYW1ld29yay5cblx0XHQvLyBUaGlzIGlzIG5vdCB0byBiZSB1c2VkIGluIHByb2R1Y3Rpb25cblx0XHRsZXQgY291bnRyeSA9ICcnO1xuXHRcdHN3aXRjaCAoZnJhbWV3b3JrKSB7XG5cdFx0XHRjYXNlICd0Y2Z2Mic6XG5cdFx0XHRcdGNvdW50cnkgPSAnR0InO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnY2NwYSc6XG5cdFx0XHRcdGNvdW50cnkgPSAnVVMnO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnYXVzJzpcblx0XHRcdFx0Y291bnRyeSA9ICdBVSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdC8vIGRvIHRoaXMgbG9hZHMgdG8gbWFrZSBzdXJlIHRoYXQgZG9lc24ndCBicmVhayB0aGluZ3Ncblx0XHRjbXAuaW5pdCh7IGNvdW50cnkgfSk7XG5cdFx0Y21wLmluaXQoeyBjb3VudHJ5IH0pO1xuXHRcdGNtcC5pbml0KHsgY291bnRyeSB9KTtcblx0XHRjbXAuaW5pdCh7IGNvdW50cnkgfSk7XG5cdH0pO1xuXG48L3NjcmlwdD5cblxuPG1haW4+XG5cdDxuYXY+XG5cdFx0PGJ1dHRvbiBvbjpjbGljaz17Y21wLnNob3dQcml2YWN5TWFuYWdlcn0gZGF0YS1jeT1cInBtXCJcblx0XHRcdD5vcGVuIHByaXZhY3kgbWFuYWdlcjwvYnV0dG9uXG5cdFx0PlxuXHRcdDxidXR0b24gb246Y2xpY2s9e2NsZWFyUHJlZmVyZW5jZXN9PmNsZWFyIHByZWZlcmVuY2VzPC9idXR0b24+XG5cdFx0PGxhYmVsIGNsYXNzPXtmcmFtZXdvcmsgPT0gJ3RjZnYyJyA/ICdzZWxlY3RlZCcgOiAnbm9uZSd9PlxuXHRcdFx0PGlucHV0XG5cdFx0XHRcdHR5cGU9XCJyYWRpb1wiXG5cdFx0XHRcdHZhbHVlPVwidGNmdjJcIlxuXHRcdFx0XHRiaW5kOmdyb3VwPXtmcmFtZXdvcmt9XG5cdFx0XHRcdG9uOmNoYW5nZT17c2V0TG9jYXRpb259XG5cdFx0XHQvPlxuXHRcdFx0aW4gUm9XOjxzdHJvbmc+VENGdjI8L3N0cm9uZz5cblx0XHQ8L2xhYmVsPlxuXHRcdDxsYWJlbCBjbGFzcz17ZnJhbWV3b3JrID09ICdjY3BhJyA/ICdzZWxlY3RlZCcgOiAnbm9uZSd9PlxuXHRcdFx0PGlucHV0XG5cdFx0XHRcdHR5cGU9XCJyYWRpb1wiXG5cdFx0XHRcdHZhbHVlPVwiY2NwYVwiXG5cdFx0XHRcdGJpbmQ6Z3JvdXA9e2ZyYW1ld29ya31cblx0XHRcdFx0b246Y2hhbmdlPXtzZXRMb2NhdGlvbn1cblx0XHRcdC8+XG5cdFx0XHRpbiBVU0E6XG5cdFx0XHQ8c3Ryb25nPkNDUEE8L3N0cm9uZz5cblx0XHQ8L2xhYmVsPlxuXHRcdDxsYWJlbCBjbGFzcz17ZnJhbWV3b3JrID09ICdhdXMnID8gJ3NlbGVjdGVkJyA6ICdub25lJ30+XG5cdFx0XHQ8aW5wdXRcblx0XHRcdFx0dHlwZT1cInJhZGlvXCJcblx0XHRcdFx0dmFsdWU9XCJhdXNcIlxuXHRcdFx0XHRiaW5kOmdyb3VwPXtmcmFtZXdvcmt9XG5cdFx0XHRcdG9uOmNoYW5nZT17c2V0TG9jYXRpb259XG5cdFx0XHQvPlxuXHRcdFx0aW4gQXVzdHJhbGlhOlxuXHRcdFx0PHN0cm9uZz5DQ1BBLWxpa2U8L3N0cm9uZz5cblx0XHQ8L2xhYmVsPlxuXHQ8L25hdj5cblxuXHQ8ZGl2IGlkPVwiY29uc2VudC1zdGF0ZVwiPlxuXHRcdHsjaWYgY29uc2VudFN0YXRlLnRjZnYyfVxuXHRcdFx0PGgyPnRjZnYyLmV2ZW50U3RhdHVzPC9oMj5cblx0XHRcdDxzcGFuIGNsYXNzPVwibGFiZWxcIj57Y29uc2VudFN0YXRlLnRjZnYyLmV2ZW50U3RhdHVzfTwvc3Bhbj5cblxuXHRcdFx0PGgyPnRjZnYyLmNvbnNlbnRzPC9oMj5cblx0XHRcdHsjZWFjaCBPYmplY3QuZW50cmllcyhjb25zZW50U3RhdGUudGNmdjIuY29uc2VudHMpIGFzIFtwdXJwb3NlLCBzdGF0ZV19XG5cdFx0XHRcdDxzcGFuXG5cdFx0XHRcdFx0Y2xhc3M9e0pTT04ucGFyc2Uoc3RhdGUpID8gJ3llcycgOiAnbm8nfVxuXHRcdFx0XHRcdGRhdGEtcHVycG9zZT17cHVycG9zZX1cblx0XHRcdFx0XHRkYXRhLWNvbnNlbnQ9e3N0YXRlfT57cHVycG9zZX08L3NwYW5cblx0XHRcdFx0PlxuXHRcdFx0ey9lYWNofVxuXG5cdFx0XHQ8aDI+dGNmdjIudmVuZG9yQ29uc2VudHM8L2gyPlxuXHRcdFx0eyNlYWNoIE9iamVjdC5lbnRyaWVzKGNvbnNlbnRTdGF0ZS50Y2Z2Mi52ZW5kb3JDb25zZW50cykgYXMgW2NvbnNlbnQsIHN0YXRlXX1cblx0XHRcdFx0PHNwYW4gY2xhc3M9e0pTT04ucGFyc2Uoc3RhdGUpID8gJ3llcycgOiAnbm8nfT57Y29uc2VudH08L3NwYW4+XG5cdFx0XHR7L2VhY2h9XG5cdFx0ezplbHNlIGlmIGNvbnNlbnRTdGF0ZS5jY3BhfVxuXHRcdFx0PGgyPmNjcGEuZG9Ob3RTZWxsPC9oMj5cblx0XHRcdDxzcGFuIGNsYXNzPVwibGFiZWxcIiBkYXRhLWRvbm90c2VsbD17Y29uc2VudFN0YXRlLmNjcGEuZG9Ob3RTZWxsfVxuXHRcdFx0XHQ+e2NvbnNlbnRTdGF0ZS5jY3BhLmRvTm90U2VsbH08L3NwYW5cblx0XHRcdD5cblx0XHR7OmVsc2UgaWYgY29uc2VudFN0YXRlLmF1c31cblx0XHRcdDxoMj5hdXMucGVyc29uYWxpc2VkQWR2ZXJ0aXNpbmc8L2gyPlxuXHRcdFx0PHNwYW5cblx0XHRcdFx0ZGF0YS1wZXJzb25hbGlzZWQtYWR2ZXJ0aXNpbmc9e2NvbnNlbnRTdGF0ZS5hdXNcblx0XHRcdFx0XHQucGVyc29uYWxpc2VkQWR2ZXJ0aXNpbmd9XG5cdFx0XHRcdGNsYXNzPXtjb25zZW50U3RhdGUuYXVzLnBlcnNvbmFsaXNlZEFkdmVydGlzaW5nID8gJ3llcycgOiAnbm8nfVxuXHRcdFx0XHQ+e2NvbnNlbnRTdGF0ZS5hdXMucGVyc29uYWxpc2VkQWR2ZXJ0aXNpbmd9PC9zcGFuXG5cdFx0XHQ+XG5cdFx0ezplbHNlfVxuXHRcdFx0PGgyPsKvXFxfKOODhClfL8KvPC9oMj5cblx0XHR7L2lmfVxuXHQ8L2Rpdj5cblxuXHQ8b2wgaWQ9XCJldmVudHNcIj5cblx0XHR7I2VhY2ggZXZlbnRzTGlzdCBhcyB7IHRpdGxlLCBwYXlsb2FkIH19XG5cdFx0XHQ8bGk+XG5cdFx0XHRcdDxkZXRhaWxzPlxuXHRcdFx0XHRcdDxzdW1tYXJ5Pnt0aXRsZX08L3N1bW1hcnk+XG5cdFx0XHRcdFx0PHByZT57SlNPTi5zdHJpbmdpZnkocGF5bG9hZCwgbnVsbCwgNCl9PC9wcmU+XG5cdFx0XHRcdDwvZGV0YWlscz5cblx0XHRcdDwvbGk+XG5cdFx0ey9lYWNofVxuXHQ8L29sPlxuPC9tYWluPlxuXG48c3R5bGU+XG5cdCoge1xuXHRcdGZvbnQtZmFtaWx5OiBTRk1vbm8tUmVndWxhciwgQ29uc29sYXMsIExpYmVyYXRpb24gTW9ubywgTWVubG8sIG1vbm9zcGFjZTtcblx0XHRmb250LXNpemU6IDEycHg7XG5cdH1cblxuXHRtYWluIHtcblx0XHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdFx0dG9wOiAwO1xuXHRcdGJvdHRvbTogMDtcblx0XHRsZWZ0OiAwO1xuXHRcdHJpZ2h0OiAwO1xuXHRcdGRpc3BsYXk6IGdyaWQ7XG5cdFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDQwMHB4O1xuXHRcdGdyaWQtdGVtcGxhdGUtcm93czogYXV0byAxZnI7XG5cdFx0Z3JpZC10ZW1wbGF0ZS1hcmVhczpcblx0XHRcdCdmb290ZXIgc2lkZWJhcidcblx0XHRcdCdtYWluIHNpZGViYXInO1xuXHR9XG5cblx0bWFpbiA+ICoge1xuXHRcdG92ZXJmbG93OiBhdXRvO1xuXHR9XG5cblx0bmF2IHtcblx0XHRncmlkLWFyZWE6IGZvb3Rlcjtcblx0XHRwYWRkaW5nOiAwLjVyZW07XG5cdFx0YWxpZ24tc2VsZjogZW5kO1xuXHRcdGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG5cdFx0ei1pbmRleDogMTtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHR9XG5cblx0bmF2ICoge1xuXHRcdGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFNlZ29lIFVJLCBIZWx2ZXRpY2EsXG5cdFx0XHRBcmlhbCwgc2Fucy1zZXJpZiwgQXBwbGUgQ29sb3IgRW1vamksIFNlZ29lIFVJIEVtb2ppO1xuXHRcdG1hcmdpbjogMCAwLjI1ZW0gMDtcblx0fVxuXG5cdG5hdiAqICsgKiB7XG5cdFx0bWFyZ2luLWxlZnQ6IDAuNWVtO1xuXHRcdG1heC13aWR0aDogNTAlO1xuXHR9XG5cblx0I2NvbnNlbnQtc3RhdGUge1xuXHRcdGdyaWQtYXJlYTogbWFpbjtcblx0XHRwYWRkaW5nOiAxcmVtO1xuXHR9XG5cblx0I2V2ZW50cyB7XG5cdFx0Z3JpZC1hcmVhOiBzaWRlYmFyO1xuXHRcdGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcblx0XHRwYWRkaW5nOiAwO1xuXHRcdGJvcmRlci1sZWZ0OiBibGFjayBzb2xpZCAxcHg7XG5cdFx0b3ZlcmZsb3c6IGF1dG87XG5cdFx0bWFyZ2luOiAwO1xuXHR9XG5cblx0I2V2ZW50cyBsaSB7XG5cdFx0Ym9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlZWU7XG5cdFx0cGFkZGluZzogMDtcblx0fVxuXG5cdCNldmVudHMgcHJlIHtcblx0XHRtYXJnaW46IDA7XG5cdFx0YmFja2dyb3VuZC1jb2xvcjogb2xkbGFjZTtcblx0XHRjb2xvcjogZGVlcHBpbms7XG5cdFx0cGFkZGluZzogMC40ZW0gMC41ZW07XG5cdH1cblxuXHRsYWJlbCB7XG5cdFx0ZGlzcGxheTogaW5saW5lLWZsZXg7XG5cdFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcblx0XHRwYWRkaW5nOiAwLjI1ZW07XG5cdFx0Ym9yZGVyLXJhZGl1czogMC4yNWVtO1xuXHRcdGJvcmRlcjogcmdiYSgwLCAwLCAwLCAwLjEpIHNvbGlkIDFweDtcblx0fVxuXG5cdGxhYmVsLnNlbGVjdGVkIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGdyZXk7XG5cdH1cblxuXHRzdW1tYXJ5IHtcblx0XHRjdXJzb3I6IHBvaW50ZXI7XG5cdFx0cGFkZGluZzogMC4yZW0gMC41ZW07XG5cdH1cblxuXHQueWVzLFxuXHQubm8sXG5cdC5sYWJlbCB7XG5cdFx0ZGlzcGxheTogaW5saW5lLWZsZXg7XG5cdFx0bWluLWhlaWdodDogMS41cmVtO1xuXHRcdG1pbi13aWR0aDogMS41cmVtO1xuXHRcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0bWFyZ2luLXJpZ2h0OiAxcHg7XG5cdFx0bWFyZ2luLWJvdHRvbTogMXB4O1xuXHRcdGZvbnQtd2VpZ2h0OiBub3JtYWw7XG5cdFx0cGFkZGluZzogMCAxY2g7XG5cdFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcblx0fVxuXG5cdC55ZXMge1xuXHRcdGJhY2tncm91bmQtY29sb3I6IGNoYXJ0cmV1c2U7XG5cdH1cblxuXHQubm8ge1xuXHRcdGJhY2tncm91bmQtY29sb3I6ICNmZjFhNGY7XG5cdH1cblxuXHQubGFiZWwge1xuXHRcdHdpZHRoOiBhdXRvO1xuXHRcdGZvbnQtd2VpZ2h0OiBub3JtYWw7XG5cdFx0YmFja2dyb3VuZC1jb2xvcjogb2xkbGFjZTtcblx0XHRjb2xvcjogZGVlcHBpbms7XG5cdH1cblxuXHRoMiB7XG5cdFx0Zm9udC13ZWlnaHQ6IG5vcm1hbDtcblx0XHRtYXJnaW46IDAgMCAwLjJyZW07XG5cdH1cblxuXHQqICsgaDIge1xuXHRcdG1hcmdpbi10b3A6IDFyZW07XG5cdH1cblxuPC9zdHlsZT5cbiIsImltcG9ydCBBcHAgZnJvbSAnLi9BcHAuc3ZlbHRlJztcblxuY29uc3QgYXBwID0gbmV3IEFwcCh7XG5cdHRhcmdldDogZG9jdW1lbnQuYm9keSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBhcHA7XG4iXSwibmFtZXMiOlsibm9vcCIsInJ1biIsImZuIiwiYmxhbmtfb2JqZWN0IiwiT2JqZWN0IiwiY3JlYXRlIiwicnVuX2FsbCIsImZucyIsImZvckVhY2giLCJpc19mdW5jdGlvbiIsInRoaW5nIiwic2FmZV9ub3RfZXF1YWwiLCJhIiwiYiIsImlzX2VtcHR5Iiwib2JqIiwia2V5cyIsImxlbmd0aCIsIm51bGxfdG9fZW1wdHkiLCJ2YWx1ZSIsImFwcGVuZCIsInRhcmdldCIsIm5vZGUiLCJhcHBlbmRDaGlsZCIsImluc2VydCIsImFuY2hvciIsImluc2VydEJlZm9yZSIsImRldGFjaCIsInBhcmVudE5vZGUiLCJyZW1vdmVDaGlsZCIsImRlc3Ryb3lfZWFjaCIsIml0ZXJhdGlvbnMiLCJkZXRhY2hpbmciLCJpIiwiZCIsImVsZW1lbnQiLCJuYW1lIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGV4dCIsImRhdGEiLCJjcmVhdGVUZXh0Tm9kZSIsInNwYWNlIiwiZW1wdHkiLCJsaXN0ZW4iLCJldmVudCIsImhhbmRsZXIiLCJvcHRpb25zIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJhdHRyIiwiYXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiY2hpbGRyZW4iLCJBcnJheSIsImZyb20iLCJjaGlsZE5vZGVzIiwic2V0X2RhdGEiLCJ3aG9sZVRleHQiLCJjdXJyZW50X2NvbXBvbmVudCIsInNldF9jdXJyZW50X2NvbXBvbmVudCIsImNvbXBvbmVudCIsImdldF9jdXJyZW50X2NvbXBvbmVudCIsIkVycm9yIiwib25Nb3VudCIsIiQkIiwib25fbW91bnQiLCJwdXNoIiwiZGlydHlfY29tcG9uZW50cyIsImJpbmRpbmdfY2FsbGJhY2tzIiwicmVuZGVyX2NhbGxiYWNrcyIsImZsdXNoX2NhbGxiYWNrcyIsInJlc29sdmVkX3Byb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInVwZGF0ZV9zY2hlZHVsZWQiLCJzY2hlZHVsZV91cGRhdGUiLCJ0aGVuIiwiZmx1c2giLCJhZGRfcmVuZGVyX2NhbGxiYWNrIiwiZmx1c2hpbmciLCJzZWVuX2NhbGxiYWNrcyIsIlNldCIsInVwZGF0ZSIsInBvcCIsImNhbGxiYWNrIiwiaGFzIiwiYWRkIiwiY2xlYXIiLCJmcmFnbWVudCIsImJlZm9yZV91cGRhdGUiLCJkaXJ0eSIsInAiLCJjdHgiLCJhZnRlcl91cGRhdGUiLCJvdXRyb2luZyIsInRyYW5zaXRpb25faW4iLCJibG9jayIsImxvY2FsIiwiZGVsZXRlIiwibW91bnRfY29tcG9uZW50IiwiY3VzdG9tRWxlbWVudCIsIm9uX2Rlc3Ryb3kiLCJtIiwibmV3X29uX2Rlc3Ryb3kiLCJtYXAiLCJmaWx0ZXIiLCJkZXN0cm95X2NvbXBvbmVudCIsIm1ha2VfZGlydHkiLCJmaWxsIiwiaW5pdCIsImluc3RhbmNlIiwiY3JlYXRlX2ZyYWdtZW50Iiwibm90X2VxdWFsIiwicHJvcHMiLCJwYXJlbnRfY29tcG9uZW50IiwiYm91bmQiLCJvbl9kaXNjb25uZWN0IiwiY29udGV4dCIsIk1hcCIsImNhbGxiYWNrcyIsInNraXBfYm91bmQiLCJyZWFkeSIsInJldCIsImh5ZHJhdGUiLCJub2RlcyIsImwiLCJjIiwiaW50cm8iLCJTdmVsdGVDb21wb25lbnQiLCIkZGVzdHJveSIsIiRvbiIsInR5cGUiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCIkc2V0IiwiJCRwcm9wcyIsIiQkc2V0IiwiX19jbGFzc1ByaXZhdGVGaWVsZFNldCIsInJlY2VpdmVyIiwic3RhdGUiLCJraW5kIiwiZiIsIlR5cGVFcnJvciIsImNhbGwiLCJzZXQiLCJfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0IiwiZ2V0IiwiX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UiLCJfbG9jYWwiLCJfc2Vzc2lvbiIsIl9hJDIiLCJTdG9yYWdlRmFjdG9yeSIsImNvbnN0cnVjdG9yIiwic3RvcmFnZSIsInVpZCIsIkRhdGUiLCJ0b1N0cmluZyIsInNldEl0ZW0iLCJhdmFpbGFibGUiLCJnZXRJdGVtIiwicmVtb3ZlSXRlbSIsImUiLCJpc0F2YWlsYWJsZSIsIkJvb2xlYW4iLCJrZXkiLCJleHBpcmVzIiwiSlNPTiIsInBhcnNlIiwicmVtb3ZlIiwic3RyaW5naWZ5IiwiZ2V0UmF3Iiwic2V0UmF3IiwiV2Vha01hcCIsImxvY2FsU3RvcmFnZSIsInNlc3Npb24iLCJzZXNzaW9uU3RvcmFnZSIsInRlYW1zIiwiY29tbW9uIiwiYmFja2dyb3VuZCIsImZvbnQiLCJjb21tZXJjaWFsIiwiY21wIiwiZG90Y29tIiwiZGVzaWduIiwidHgiLCJfYSQxIiwiS0VZIiwidGVhbUNvbG91cnMiLCJzdHlsZSIsInRlYW0iLCJsb2ciLCJpbmNsdWRlcyIsInN0eWxlcyIsImFyZ3MiLCJjb25zb2xlIiwic3Vic2NyaWJlVG8iLCJ0ZWFtU3Vic2NyaXB0aW9ucyIsInNwbGl0Iiwiam9pbiIsInVuc3Vic2NyaWJlRnJvbSIsInQiLCJ3aW5kb3ciLCJndWFyZGlhbiIsImxvZ2dlciIsImN1cnJlbnRGcmFtZXdvcmsiLCJzZXRDdXJyZW50RnJhbWV3b3JrIiwiZnJhbWV3b3JrIiwiZ2V0Q3VycmVudEZyYW1ld29yayIsIm1hcmsiLCJsYWJlbCIsInBlcmZvcm1hbmNlIiwiaXNTZXJ2ZXJTaWRlIiwic2VydmVyU2lkZVdhcm4iLCJ3YXJuIiwic2VydmVyU2lkZVdhcm5BbmRSZXR1cm4iLCJhcmciLCJjbXAkMSIsIl9fZGlzYWJsZSIsIl9fZW5hYmxlIiwiX19pc0Rpc2FibGVkIiwiaGFzSW5pdGlhbGlzZWQiLCJzaG93UHJpdmFjeU1hbmFnZXIiLCJ2ZXJzaW9uIiwid2lsbFNob3dQcml2YWN5TWVzc2FnZSIsIndpbGxTaG93UHJpdmFjeU1lc3NhZ2VTeW5jIiwib25Db25zZW50JDIiLCJjYW5UYXJnZXQiLCJvbkNvbnNlbnRDaGFuZ2UkMiIsImdldENvbnNlbnRGb3IkMiIsInZlbmRvciIsImNvbnNlbnQiLCJpc0d1YXJkaWFuIiwiaXNHdWFyZGlhbkRvbWFpbiIsImxvY2F0aW9uIiwiaG9zdCIsImVuZHNXaXRoIiwiQUNDT1VOVF9JRCIsIlBSSVZBQ1lfTUFOQUdFUl9DQ1BBIiwiUFJJVkFDWV9NQU5BR0VSX1RDRlYyIiwiUFJJVkFDWV9NQU5BR0VSX0FVU1RSQUxJQSIsIkVORFBPSU5UIiwiYXBpJDIiLCJjb21tYW5kIiwicmVqZWN0IiwiX191c3BhcGkiLCJyZXN1bHQiLCJzdWNjZXNzIiwiZ2V0VVNQRGF0YSQxIiwiZ2V0Q29uc2VudFN0YXRlJDMiLCJ1c3BEYXRhIiwib3B0ZWRPdXQiLCJ1c3BTdHJpbmciLCJjaGFyQXQiLCJwZXJzb25hbGlzZWRBZHZlcnRpc2luZyIsImFwaSQxIiwiZ2V0VVNQRGF0YSIsImdldENvbnNlbnRTdGF0ZSQyIiwiZG9Ob3RTZWxsIiwiZ2V0R3BjU2lnbmFsIiwidW5kZWZpbmVkIiwibmF2aWdhdG9yIiwiZ2xvYmFsUHJpdmFjeUNvbnRyb2wiLCJhcGkiLCJfX3RjZmFwaSIsImdldFRDRGF0YSIsImdldEN1c3RvbVZlbmRvckNvbnNlbnRzIiwiZGVmYXVsdENvbnNlbnRzIiwiZ2V0Q29uc2VudFN0YXRlJDEiLCJ0Y0RhdGEiLCJjdXN0b21WZW5kb3JzIiwiYWxsIiwiY29uc2VudHMiLCJwdXJwb3NlIiwiZXZlbnRTdGF0dXMiLCJnZHByQXBwbGllcyIsInRjU3RyaW5nIiwiYWRkdGxDb25zZW50IiwiZ3JhbnRzIiwidmVuZG9yQ29uc2VudHMiLCJzb3J0IiwicmVkdWNlIiwiYWNjIiwiY3VyIiwidmVuZG9yR3JhbnQiLCJjYWxsQmFja1F1ZXVlIiwiYXdhaXRpbmdVc2VySW50ZXJhY3Rpb25JblRDRnYyIiwidGNmdjIiLCJpbnZva2VDYWxsYmFjayIsInN0YXRlU3RyaW5nIiwibGFzdFN0YXRlIiwiZW5oYW5jZUNvbnNlbnRTdGF0ZSIsImNvbnNlbnRTdGF0ZSIsImdwY1NpZ25hbCIsIl9vYmplY3RTcHJlYWQiLCJ2YWx1ZXMiLCJldmVyeSIsImNjcGEiLCJhdXMiLCJnZXRDb25zZW50U3RhdGUiLCJpbnZva2VDYWxsYmFja3MiLCJvbkNvbnNlbnRDaGFuZ2UkMSIsImNhbGxCYWNrIiwibmV3Q2FsbGJhY2siLCJjYXRjaCIsInN0dWJfY2NwYSIsInIiLCJmcmFtZXMiLCJib2R5IiwiY3NzVGV4dCIsInNldFRpbWVvdXQiLCJhcmd1bWVudHMiLCJnZHByQXBwbGllc0dsb2JhbGx5IiwiY21wTG9hZGVkIiwic2xpY2UiLCJhcHBseSIsIl9fY21wQ2FsbCIsIm4iLCJwYXJhbWV0ZXIiLCJfX2NtcFJldHVybiIsInJldHVyblZhbHVlIiwiY2FsbElkIiwic291cmNlIiwicG9zdE1lc3NhZ2UiLCJtc2dIYW5kbGVyIiwic3R1Yl90Y2Z2MiIsImV4cG9ydHMiLCJvIiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJfX2VzTW9kdWxlIiwiYmluZCIsImRlZmF1bHQiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsInMiLCJfX3RjZmFwaUxvY2F0b3IiLCJwYXJzZUludCIsImFwaVZlcnNpb24iLCJfX3RjZmFwaUNhbGwiLCJfX3RjZmFwaVJldHVybiIsIkZ1bmN0aW9uIiwidSIsImNvbmZpZ3VyYWJsZSIsIm1hdGNoIiwiTWF0aCIsImdsb2JhbFRoaXMiLCJzZWxmIiwiU3RyaW5nIiwidmFsdWVPZiIsInN0dWIiLCJyZXNvbHZlV2lsbFNob3dQcml2YWN5TWVzc2FnZSIsIndpbGxTaG93UHJpdmFjeU1lc3NhZ2UkMiIsImdldFByb3BlcnR5IiwiaW5pdCQyIiwicHViRGF0YSIsIl9zcF8iLCJmcmFtZXdvcmtNZXNzYWdlVHlwZSIsIl9zcF9xdWV1ZSIsImNvbmZpZyIsImJhc2VFbmRwb2ludCIsImFjY291bnRJZCIsInByb3BlcnR5SHJlZiIsInRhcmdldGluZ1BhcmFtcyIsImNtcEluaXRUaW1lVXRjIiwiZ2V0VGltZSIsImV2ZW50cyIsIm9uQ29uc2VudFJlYWR5IiwibWVzc2FnZV90eXBlIiwiY29uc2VudFVVSUQiLCJldWNvbnNlbnQiLCJvbk1lc3NhZ2VSZWFkeSIsIm9uTWVzc2FnZVJlY2VpdmVEYXRhIiwibWVzc2FnZUlkIiwib25NZXNzYWdlQ2hvaWNlU2VsZWN0IiwiY2hvaWNlX2lkIiwiY2hvaWNlVHlwZUlEIiwib25Qcml2YWN5TWFuYWdlckFjdGlvbiIsInBtRGF0YSIsIm9uTWVzc2FnZUNob2ljZUVycm9yIiwiZXJyIiwib25QTUNhbmNlbCIsIm9uU1BQTU9iamVjdFJlYWR5Iiwib25FcnJvciIsImVycm9yQ29kZSIsImVycm9yT2JqZWN0IiwidXNlclJlc2V0IiwiZ2RwciIsInNwTGliIiwiaWQiLCJzcmMiLCJpbml0JDEiLCJ3aWxsU2hvd1ByaXZhY3lNZXNzYWdlJDEiLCJzaG93UHJpdmFjeU1hbmFnZXIkMSIsImxvYWRQcml2YWN5TWFuYWdlck1vZGFsIiwiQ01QIiwiQ09PS0lFX05BTUUiLCJkaXNhYmxlIiwiY29va2llIiwiZW5hYmxlIiwiaXNEaXNhYmxlZCIsIlJlZ0V4cCIsInRlc3QiLCJWZW5kb3JJRHMiLCJhOSIsImFjYXN0IiwiYnJhemUiLCJjb21zY29yZSIsImZiIiwiZ29vZ2xldGFnIiwiaWFzIiwiaW5pemlvIiwiaXBzb3MiLCJsaW5rZWRpbiIsImxvdGFtZSIsIm5pZWxzZW4iLCJvcGhhbiIsInBlcm11dGl2ZSIsInByZWJpZCIsInJlZHBsYW5ldCIsInJlbWFya2V0aW5nIiwic2VudHJ5IiwidGVhZHMiLCJ0d2l0dGVyIiwiZ2V0Q29uc2VudEZvciQxIiwic291cmNlcG9pbnRJZHMiLCJmb3VuZFNvdXJjZXBvaW50SWQiLCJmaW5kIiwidGNmdjJDb25zZW50IiwiZ2V0RnJhbWV3b3JrIiwiY291bnRyeUNvZGUiLCJvbkNvbnNlbnQkMSIsIl9hIiwiX2IiLCJfYyIsIl9kIiwiZ3VDbXBIb3RGaXgiLCJfd2lsbFNob3dQcml2YWN5TWVzc2FnZSIsImluaXRDb21wbGV0ZSIsInJlc29sdmVJbml0aWFsaXNlZCIsImluaXRpYWxpc2VkIiwiY291bnRyeSIsIndpbGxTaG93VmFsdWUiLCJvbkNvbnNlbnQiLCJvbkNvbnNlbnRDaGFuZ2UiLCJnZXRDb25zZW50Rm9yIiwidGhpcyIsImFwcCIsIkFw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
