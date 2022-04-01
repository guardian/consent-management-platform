
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

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
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

var getConsentState = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* () {
    switch (getCurrentFramework()) {
      case 'aus':
        return {
          aus: yield getConsentState$3()
        };

      case 'ccpa':
        return {
          ccpa: yield getConsentState$2()
        };

      case 'tcfv2':
        return {
          tcfv2: yield getConsentState$1()
        };

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

          var o = r.__tcfapiCall;
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
    throw new Error("Vendor '".concat(vendor, "' not found, or with no Sourcepoint ID. ") + 'If it should be added, raise an issue at https://git.io/JUzVL');
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

var _a$3, _b, _c;

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
var onConsentChange = isServerSide ? onConsentChange$2 : (_b = window.guCmpHotFix).onConsentChange || (_b.onConsentChange = onConsentChange$1);
isServerSide ? getConsentFor$2 : (_c = window.guCmpHotFix).getConsentFor || (_c.getConsentFor = getConsentFor$1);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvaW50ZXJuYWwvaW5kZXgubWpzIiwiLi4vLi4vZGlzdC9pbmRleC5lc20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGd1YXJkaWFuL2xpYnMvZGlzdC9lc20vc3RvcmFnZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9AZ3VhcmRpYW4vbGlicy9kaXN0L2VzbS9sb2dnZXIudGVhbXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGd1YXJkaWFuL2xpYnMvZGlzdC9lc20vbG9nZ2VyLmpzIiwiLi4vQXBwLnN2ZWx0ZSIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5vb3AoKSB7IH1cbmNvbnN0IGlkZW50aXR5ID0geCA9PiB4O1xuZnVuY3Rpb24gYXNzaWduKHRhciwgc3JjKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvciAoY29uc3QgayBpbiBzcmMpXG4gICAgICAgIHRhcltrXSA9IHNyY1trXTtcbiAgICByZXR1cm4gdGFyO1xufVxuZnVuY3Rpb24gaXNfcHJvbWlzZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYWRkX2xvY2F0aW9uKGVsZW1lbnQsIGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhcikge1xuICAgIGVsZW1lbnQuX19zdmVsdGVfbWV0YSA9IHtcbiAgICAgICAgbG9jOiB7IGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhciB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJ1bihmbikge1xuICAgIHJldHVybiBmbigpO1xufVxuZnVuY3Rpb24gYmxhbmtfb2JqZWN0KCkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gcnVuX2FsbChmbnMpIHtcbiAgICBmbnMuZm9yRWFjaChydW4pO1xufVxuZnVuY3Rpb24gaXNfZnVuY3Rpb24odGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gc2FmZV9ub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiIHx8ICgoYSAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBhID09PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIG5vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGI7XG59XG5mdW5jdGlvbiBpc19lbXB0eShvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zdG9yZShzdG9yZSwgbmFtZSkge1xuICAgIGlmIChzdG9yZSAhPSBudWxsICYmIHR5cGVvZiBzdG9yZS5zdWJzY3JpYmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtuYW1lfScgaXMgbm90IGEgc3RvcmUgd2l0aCBhICdzdWJzY3JpYmUnIG1ldGhvZGApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHN1YnNjcmliZShzdG9yZSwgLi4uY2FsbGJhY2tzKSB7XG4gICAgaWYgKHN0b3JlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuICAgIGNvbnN0IHVuc3ViID0gc3RvcmUuc3Vic2NyaWJlKC4uLmNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHVuc3ViLnVuc3Vic2NyaWJlID8gKCkgPT4gdW5zdWIudW5zdWJzY3JpYmUoKSA6IHVuc3ViO1xufVxuZnVuY3Rpb24gZ2V0X3N0b3JlX3ZhbHVlKHN0b3JlKSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIHN1YnNjcmliZShzdG9yZSwgXyA9PiB2YWx1ZSA9IF8pKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gY29tcG9uZW50X3N1YnNjcmliZShjb21wb25lbnQsIHN0b3JlLCBjYWxsYmFjaykge1xuICAgIGNvbXBvbmVudC4kJC5vbl9kZXN0cm95LnB1c2goc3Vic2NyaWJlKHN0b3JlLCBjYWxsYmFjaykpO1xufVxuZnVuY3Rpb24gY3JlYXRlX3Nsb3QoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY3R4ID0gZ2V0X3Nsb3RfY29udGV4dChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKTtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25bMF0oc2xvdF9jdHgpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIHJldHVybiBkZWZpbml0aW9uWzFdICYmIGZuXG4gICAgICAgID8gYXNzaWduKCQkc2NvcGUuY3R4LnNsaWNlKCksIGRlZmluaXRpb25bMV0oZm4oY3R4KSkpXG4gICAgICAgIDogJCRzY29wZS5jdHg7XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jaGFuZ2VzKGRlZmluaXRpb24sICQkc2NvcGUsIGRpcnR5LCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uWzJdICYmIGZuKSB7XG4gICAgICAgIGNvbnN0IGxldHMgPSBkZWZpbml0aW9uWzJdKGZuKGRpcnR5KSk7XG4gICAgICAgIGlmICgkJHNjb3BlLmRpcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsZXRzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbGV0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gTWF0aC5tYXgoJCRzY29wZS5kaXJ0eS5sZW5ndGgsIGxldHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSAkJHNjb3BlLmRpcnR5W2ldIHwgbGV0c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQkc2NvcGUuZGlydHkgfCBsZXRzO1xuICAgIH1cbiAgICByZXR1cm4gJCRzY29wZS5kaXJ0eTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgaWYgKHNsb3RfY2hhbmdlcykge1xuICAgICAgICBjb25zdCBzbG90X2NvbnRleHQgPSBnZXRfc2xvdF9jb250ZXh0KHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbiAgICAgICAgc2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcbiAgICB9XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9zcHJlYWQoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGRpcnR5LCBnZXRfc2xvdF9jaGFuZ2VzX2ZuLCBnZXRfc2xvdF9zcHJlYWRfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X3NwcmVhZF9jaGFuZ2VzX2ZuKGRpcnR5KSB8IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgaWYgKHNsb3RfY2hhbmdlcykge1xuICAgICAgICBjb25zdCBzbG90X2NvbnRleHQgPSBnZXRfc2xvdF9jb250ZXh0KHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbiAgICAgICAgc2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcbiAgICB9XG59XG5mdW5jdGlvbiBleGNsdWRlX2ludGVybmFsX3Byb3BzKHByb3BzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoa1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdWx0W2tdID0gcHJvcHNba107XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfcmVzdF9wcm9wcyhwcm9wcywga2V5cykge1xuICAgIGNvbnN0IHJlc3QgPSB7fTtcbiAgICBrZXlzID0gbmV3IFNldChrZXlzKTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcHJvcHMpXG4gICAgICAgIGlmICgha2V5cy5oYXMoaykgJiYga1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN0O1xufVxuZnVuY3Rpb24gY29tcHV0ZV9zbG90cyhzbG90cykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHNsb3RzKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICBsZXQgcmFuID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGlmIChyYW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgIGZuLmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIG51bGxfdG9fZW1wdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG59XG5mdW5jdGlvbiBzZXRfc3RvcmVfdmFsdWUoc3RvcmUsIHJldCwgdmFsdWUgPSByZXQpIHtcbiAgICBzdG9yZS5zZXQodmFsdWUpO1xuICAgIHJldHVybiByZXQ7XG59XG5jb25zdCBoYXNfcHJvcCA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xuZnVuY3Rpb24gYWN0aW9uX2Rlc3Ryb3llcihhY3Rpb25fcmVzdWx0KSB7XG4gICAgcmV0dXJuIGFjdGlvbl9yZXN1bHQgJiYgaXNfZnVuY3Rpb24oYWN0aW9uX3Jlc3VsdC5kZXN0cm95KSA/IGFjdGlvbl9yZXN1bHQuZGVzdHJveSA6IG5vb3A7XG59XG5cbmNvbnN0IGlzX2NsaWVudCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xubGV0IG5vdyA9IGlzX2NsaWVudFxuICAgID8gKCkgPT4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgOiAoKSA9PiBEYXRlLm5vdygpO1xubGV0IHJhZiA9IGlzX2NsaWVudCA/IGNiID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShjYikgOiBub29wO1xuLy8gdXNlZCBpbnRlcm5hbGx5IGZvciB0ZXN0aW5nXG5mdW5jdGlvbiBzZXRfbm93KGZuKSB7XG4gICAgbm93ID0gZm47XG59XG5mdW5jdGlvbiBzZXRfcmFmKGZuKSB7XG4gICAgcmFmID0gZm47XG59XG5cbmNvbnN0IHRhc2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gcnVuX3Rhc2tzKG5vdykge1xuICAgIHRhc2tzLmZvckVhY2godGFzayA9PiB7XG4gICAgICAgIGlmICghdGFzay5jKG5vdykpIHtcbiAgICAgICAgICAgIHRhc2tzLmRlbGV0ZSh0YXNrKTtcbiAgICAgICAgICAgIHRhc2suZigpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHRhc2tzLnNpemUgIT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xufVxuLyoqXG4gKiBGb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5IVxuICovXG5mdW5jdGlvbiBjbGVhcl9sb29wcygpIHtcbiAgICB0YXNrcy5jbGVhcigpO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHRhc2sgdGhhdCBydW5zIG9uIGVhY2ggcmFmIGZyYW1lXG4gKiB1bnRpbCBpdCByZXR1cm5zIGEgZmFsc3kgdmFsdWUgb3IgaXMgYWJvcnRlZFxuICovXG5mdW5jdGlvbiBsb29wKGNhbGxiYWNrKSB7XG4gICAgbGV0IHRhc2s7XG4gICAgaWYgKHRhc2tzLnNpemUgPT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IG5ldyBQcm9taXNlKGZ1bGZpbGwgPT4ge1xuICAgICAgICAgICAgdGFza3MuYWRkKHRhc2sgPSB7IGM6IGNhbGxiYWNrLCBmOiBmdWxmaWxsIH0pO1xuICAgICAgICB9KSxcbiAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG59XG5mdW5jdGlvbiBkZXRhY2gobm9kZSkge1xuICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfZWFjaChpdGVyYXRpb25zLCBkZXRhY2hpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnNbaV0pXG4gICAgICAgICAgICBpdGVyYXRpb25zW2ldLmQoZGV0YWNoaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBlbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRfaXMobmFtZSwgaXMpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lLCB7IGlzIH0pO1xufVxuZnVuY3Rpb24gb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcyhvYmosIGV4Y2x1ZGUpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXNfcHJvcChvYmosIGspXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAmJiBleGNsdWRlLmluZGV4T2YoaykgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICB0YXJnZXRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIHN2Z19lbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5hbWUpO1xufVxuZnVuY3Rpb24gdGV4dChkYXRhKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xufVxuZnVuY3Rpb24gc3BhY2UoKSB7XG4gICAgcmV0dXJuIHRleHQoJyAnKTtcbn1cbmZ1bmN0aW9uIGVtcHR5KCkge1xuICAgIHJldHVybiB0ZXh0KCcnKTtcbn1cbmZ1bmN0aW9uIGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG59XG5mdW5jdGlvbiBwcmV2ZW50X2RlZmF1bHQoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzdG9wX3Byb3BhZ2F0aW9uKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNlbGYoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcylcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICBlbHNlIGlmIChub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSlcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBzZXRfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobm9kZS5fX3Byb3RvX18pO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5jc3NUZXh0ID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ19fdmFsdWUnKSB7XG4gICAgICAgICAgICBub2RlLnZhbHVlID0gbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlc2NyaXB0b3JzW2tleV0gJiYgZGVzY3JpcHRvcnNba2V5XS5zZXQpIHtcbiAgICAgICAgICAgIG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3N2Z19hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhKG5vZGUsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgaW4gbm9kZSkge1xuICAgICAgICBub2RlW3Byb3BdID0gdHlwZW9mIG5vZGVbcHJvcF0gPT09ICdib29sZWFuJyAmJiB2YWx1ZSA9PT0gJycgPyB0cnVlIDogdmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhdHRyKG5vZGUsIHByb3AsIHZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiB4bGlua19hdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgYXR0cmlidXRlLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBnZXRfYmluZGluZ19ncm91cF92YWx1ZShncm91cCwgX192YWx1ZSwgY2hlY2tlZCkge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFNldCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGdyb3VwW2ldLmNoZWNrZWQpXG4gICAgICAgICAgICB2YWx1ZS5hZGQoZ3JvdXBbaV0uX192YWx1ZSk7XG4gICAgfVxuICAgIGlmICghY2hlY2tlZCkge1xuICAgICAgICB2YWx1ZS5kZWxldGUoX192YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHRvX251bWJlcih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gJycgPyBudWxsIDogK3ZhbHVlO1xufVxuZnVuY3Rpb24gdGltZV9yYW5nZXNfdG9fYXJyYXkocmFuZ2VzKSB7XG4gICAgY29uc3QgYXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhcnJheS5wdXNoKHsgc3RhcnQ6IHJhbmdlcy5zdGFydChpKSwgZW5kOiByYW5nZXMuZW5kKGkpIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG5mdW5jdGlvbiBjaGlsZHJlbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jaGlsZE5vZGVzKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIHN2Zykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgbGV0IGogPSAwO1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlID0gW107XG4gICAgICAgICAgICB3aGlsZSAoaiA8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBub2RlLmF0dHJpYnV0ZXNbaisrXTtcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZS5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHJlbW92ZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKHJlbW92ZVtrXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdmcgPyBzdmdfZWxlbWVudChuYW1lKSA6IGVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBjbGFpbV90ZXh0KG5vZGVzLCBkYXRhKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSAnJyArIGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gbm9kZXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0ZXh0KGRhdGEpO1xufVxuZnVuY3Rpb24gY2xhaW1fc3BhY2Uobm9kZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fdGV4dChub2RlcywgJyAnKTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhKHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCAhPT0gZGF0YSlcbiAgICAgICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X2lucHV0X3R5cGUoaW5wdXQsIHR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBpbnB1dC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdHlsZShub2RlLCBrZXksIHZhbHVlLCBpbXBvcnRhbnQpIHtcbiAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCA/ICdpbXBvcnRhbnQnIDogJycpO1xufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbihzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wdGlvbi5fX3ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb25zKHNlbGVjdCwgdmFsdWUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdC5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW2ldO1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB+dmFsdWUuaW5kZXhPZihvcHRpb24uX192YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X3ZhbHVlKHNlbGVjdCkge1xuICAgIGNvbnN0IHNlbGVjdGVkX29wdGlvbiA9IHNlbGVjdC5xdWVyeVNlbGVjdG9yKCc6Y2hlY2tlZCcpIHx8IHNlbGVjdC5vcHRpb25zWzBdO1xuICAgIHJldHVybiBzZWxlY3RlZF9vcHRpb24gJiYgc2VsZWN0ZWRfb3B0aW9uLl9fdmFsdWU7XG59XG5mdW5jdGlvbiBzZWxlY3RfbXVsdGlwbGVfdmFsdWUoc2VsZWN0KSB7XG4gICAgcmV0dXJuIFtdLm1hcC5jYWxsKHNlbGVjdC5xdWVyeVNlbGVjdG9yQWxsKCc6Y2hlY2tlZCcpLCBvcHRpb24gPT4gb3B0aW9uLl9fdmFsdWUpO1xufVxuLy8gdW5mb3J0dW5hdGVseSB0aGlzIGNhbid0IGJlIGEgY29uc3RhbnQgYXMgdGhhdCB3b3VsZG4ndCBiZSB0cmVlLXNoYWtlYWJsZVxuLy8gc28gd2UgY2FjaGUgdGhlIHJlc3VsdCBpbnN0ZWFkXG5sZXQgY3Jvc3NvcmlnaW47XG5mdW5jdGlvbiBpc19jcm9zc29yaWdpbigpIHtcbiAgICBpZiAoY3Jvc3NvcmlnaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjcm9zc29yaWdpbiA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB2b2lkIHdpbmRvdy5wYXJlbnQuZG9jdW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjcm9zc29yaWdpbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyb3Nzb3JpZ2luO1xufVxuZnVuY3Rpb24gYWRkX3Jlc2l6ZV9saXN0ZW5lcihub2RlLCBmbikge1xuICAgIGNvbnN0IGNvbXB1dGVkX3N0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICAnb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTE7Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmcmFtZS50YWJJbmRleCA9IC0xO1xuICAgIGNvbnN0IGNyb3Nzb3JpZ2luID0gaXNfY3Jvc3NvcmlnaW4oKTtcbiAgICBsZXQgdW5zdWJzY3JpYmU7XG4gICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSBcImRhdGE6dGV4dC9odG1sLDxzY3JpcHQ+b25yZXNpemU9ZnVuY3Rpb24oKXtwYXJlbnQucG9zdE1lc3NhZ2UoMCwnKicpfTwvc2NyaXB0PlwiO1xuICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3Rlbih3aW5kb3csICdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBpZnJhbWUuY29udGVudFdpbmRvdylcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICBpZnJhbWUub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4oaWZyYW1lLmNvbnRlbnRXaW5kb3csICdyZXNpemUnLCBmbik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFwcGVuZChub2RlLCBpZnJhbWUpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1bnN1YnNjcmliZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXRhY2goaWZyYW1lKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdG9nZ2xlX2NsYXNzKGVsZW1lbnQsIG5hbWUsIHRvZ2dsZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0W3RvZ2dsZSA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xufVxuZnVuY3Rpb24gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCkge1xuICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIGRldGFpbCk7XG4gICAgcmV0dXJuIGU7XG59XG5mdW5jdGlvbiBxdWVyeV9zZWxlY3Rvcl9hbGwoc2VsZWN0b3IsIHBhcmVudCA9IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufVxuY2xhc3MgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoYW5jaG9yID0gbnVsbCkge1xuICAgICAgICB0aGlzLmEgPSBhbmNob3I7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgfVxuICAgIG0oaHRtbCwgdGFyZ2V0LCBhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5lKSB7XG4gICAgICAgICAgICB0aGlzLmUgPSBlbGVtZW50KHRhcmdldC5ub2RlTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnQgPSB0YXJnZXQ7XG4gICAgICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pKGFuY2hvcik7XG4gICAgfVxuICAgIGgoaHRtbCkge1xuICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgdGhpcy5uID0gQXJyYXkuZnJvbSh0aGlzLmUuY2hpbGROb2Rlcyk7XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnQodGhpcy50LCB0aGlzLm5baV0sIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcChodG1sKSB7XG4gICAgICAgIHRoaXMuZCgpO1xuICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgICAgIHRoaXMuaSh0aGlzLmEpO1xuICAgIH1cbiAgICBkKCkge1xuICAgICAgICB0aGlzLm4uZm9yRWFjaChkZXRhY2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGF0dHJpYnV0ZV90b19vYmplY3QoYXR0cmlidXRlcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgcmVzdWx0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGdldF9jdXN0b21fZWxlbWVudHNfc2xvdHMoZWxlbWVudCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIHJlc3VsdFtub2RlLnNsb3QgfHwgJ2RlZmF1bHQnXSA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgYWN0aXZlX2RvY3MgPSBuZXcgU2V0KCk7XG5sZXQgYWN0aXZlID0gMDtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXJrc2t5YXBwL3N0cmluZy1oYXNoL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5mdW5jdGlvbiBoYXNoKHN0cikge1xuICAgIGxldCBoYXNoID0gNTM4MTtcbiAgICBsZXQgaSA9IHN0ci5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSlcbiAgICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpIF4gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGhhc2ggPj4+IDA7XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGNvbnN0IGRvYyA9IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBhY3RpdmVfZG9jcy5hZGQoZG9jKTtcbiAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQgfHwgKGRvYy5fX3N2ZWx0ZV9zdHlsZXNoZWV0ID0gZG9jLmhlYWQuYXBwZW5kQ2hpbGQoZWxlbWVudCgnc3R5bGUnKSkuc2hlZXQpO1xuICAgIGNvbnN0IGN1cnJlbnRfcnVsZXMgPSBkb2MuX19zdmVsdGVfcnVsZXMgfHwgKGRvYy5fX3N2ZWx0ZV9ydWxlcyA9IHt9KTtcbiAgICBpZiAoIWN1cnJlbnRfcnVsZXNbbmFtZV0pIHtcbiAgICAgICAgY3VycmVudF9ydWxlc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIHN0eWxlc2hlZXQuaW5zZXJ0UnVsZShgQGtleWZyYW1lcyAke25hbWV9ICR7cnVsZX1gLCBzdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgfVxuICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5vZGUuc3R5bGUuYW5pbWF0aW9uIHx8ICcnO1xuICAgIG5vZGUuc3R5bGUuYW5pbWF0aW9uID0gYCR7YW5pbWF0aW9uID8gYCR7YW5pbWF0aW9ufSwgYCA6ICcnfSR7bmFtZX0gJHtkdXJhdGlvbn1tcyBsaW5lYXIgJHtkZWxheX1tcyAxIGJvdGhgO1xuICAgIGFjdGl2ZSArPSAxO1xuICAgIHJldHVybiBuYW1lO1xufVxuZnVuY3Rpb24gZGVsZXRlX3J1bGUobm9kZSwgbmFtZSkge1xuICAgIGNvbnN0IHByZXZpb3VzID0gKG5vZGUuc3R5bGUuYW5pbWF0aW9uIHx8ICcnKS5zcGxpdCgnLCAnKTtcbiAgICBjb25zdCBuZXh0ID0gcHJldmlvdXMuZmlsdGVyKG5hbWVcbiAgICAgICAgPyBhbmltID0+IGFuaW0uaW5kZXhPZihuYW1lKSA8IDAgLy8gcmVtb3ZlIHNwZWNpZmljIGFuaW1hdGlvblxuICAgICAgICA6IGFuaW0gPT4gYW5pbS5pbmRleE9mKCdfX3N2ZWx0ZScpID09PSAtMSAvLyByZW1vdmUgYWxsIFN2ZWx0ZSBhbmltYXRpb25zXG4gICAgKTtcbiAgICBjb25zdCBkZWxldGVkID0gcHJldmlvdXMubGVuZ3RoIC0gbmV4dC5sZW5ndGg7XG4gICAgaWYgKGRlbGV0ZWQpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBuZXh0LmpvaW4oJywgJyk7XG4gICAgICAgIGFjdGl2ZSAtPSBkZWxldGVkO1xuICAgICAgICBpZiAoIWFjdGl2ZSlcbiAgICAgICAgICAgIGNsZWFyX3J1bGVzKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gY2xlYXJfcnVsZXMoKSB7XG4gICAgcmFmKCgpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYWN0aXZlX2RvY3MuZm9yRWFjaChkb2MgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGVzaGVldCA9IGRvYy5fX3N2ZWx0ZV9zdHlsZXNoZWV0O1xuICAgICAgICAgICAgbGV0IGkgPSBzdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pXG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldC5kZWxldGVSdWxlKGkpO1xuICAgICAgICAgICAgZG9jLl9fc3ZlbHRlX3J1bGVzID0ge307XG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmVfZG9jcy5jbGVhcigpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVfYW5pbWF0aW9uKG5vZGUsIGZyb20sIGZuLCBwYXJhbXMpIHtcbiAgICBpZiAoIWZyb20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHRvID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoZnJvbS5sZWZ0ID09PSB0by5sZWZ0ICYmIGZyb20ucmlnaHQgPT09IHRvLnJpZ2h0ICYmIGZyb20udG9wID09PSB0by50b3AgJiYgZnJvbS5ib3R0b20gPT09IHRvLmJvdHRvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBzaG91bGQgdGhpcyBiZSBzZXBhcmF0ZWQgZnJvbSBkZXN0cnVjdHVyaW5nPyBPciBzdGFydC9lbmQgYWRkZWQgdG8gcHVibGljIGFwaSBhbmQgZG9jdW1lbnRhdGlvbj9cbiAgICBzdGFydDogc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzpcbiAgICBlbmQgPSBzdGFydF90aW1lICsgZHVyYXRpb24sIHRpY2sgPSBub29wLCBjc3MgfSA9IGZuKG5vZGUsIHsgZnJvbSwgdG8gfSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBsZXQgbmFtZTtcbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDAsIDEsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGVsYXkpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBuYW1lKTtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgIGlmICghc3RhcnRlZCAmJiBub3cgPj0gc3RhcnRfdGltZSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQgJiYgbm93ID49IGVuZCkge1xuICAgICAgICAgICAgdGljaygxLCAwKTtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCkge1xuICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHN0YXJ0X3RpbWU7XG4gICAgICAgICAgICBjb25zdCB0ID0gMCArIDEgKiBlYXNpbmcocCAvIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHN0YXJ0KCk7XG4gICAgdGljaygwLCAxKTtcbiAgICByZXR1cm4gc3RvcDtcbn1cbmZ1bmN0aW9uIGZpeF9wb3NpdGlvbihub2RlKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChzdHlsZS5wb3NpdGlvbiAhPT0gJ2Fic29sdXRlJyAmJiBzdHlsZS5wb3NpdGlvbiAhPT0gJ2ZpeGVkJykge1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHN0eWxlO1xuICAgICAgICBjb25zdCBhID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIG5vZGUuc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgbm9kZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGFkZF90cmFuc2Zvcm0obm9kZSwgYSk7XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkX3RyYW5zZm9ybShub2RlLCBhKSB7XG4gICAgY29uc3QgYiA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGEubGVmdCAhPT0gYi5sZWZ0IHx8IGEudG9wICE9PSBiLnRvcCkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIG5vZGUuc3R5bGUudHJhbnNmb3JtID0gYCR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHthLmxlZnQgLSBiLmxlZnR9cHgsICR7YS50b3AgLSBiLnRvcH1weClgO1xuICAgIH1cbn1cblxubGV0IGN1cnJlbnRfY29tcG9uZW50O1xuZnVuY3Rpb24gc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgIGN1cnJlbnRfY29tcG9uZW50ID0gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkge1xuICAgIGlmICghY3VycmVudF9jb21wb25lbnQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRnVuY3Rpb24gY2FsbGVkIG91dHNpZGUgY29tcG9uZW50IGluaXRpYWxpemF0aW9uJyk7XG4gICAgcmV0dXJuIGN1cnJlbnRfY29tcG9uZW50O1xufVxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlKGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYmVmb3JlX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIG9uTW91bnQoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9tb3VudC5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFmdGVyVXBkYXRlKGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYWZ0ZXJfdXBkYXRlLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gb25EZXN0cm95KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fZGVzdHJveS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpIHtcbiAgICBjb25zdCBjb21wb25lbnQgPSBnZXRfY3VycmVudF9jb21wb25lbnQoKTtcbiAgICByZXR1cm4gKHR5cGUsIGRldGFpbCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBjb21wb25lbnQuJCQuY2FsbGJhY2tzW3R5cGVdO1xuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGFyZSB0aGVyZSBzaXR1YXRpb25zIHdoZXJlIGV2ZW50cyBjb3VsZCBiZSBkaXNwYXRjaGVkXG4gICAgICAgICAgICAvLyBpbiBhIHNlcnZlciAobm9uLURPTSkgZW52aXJvbm1lbnQ/XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwpO1xuICAgICAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChjb21wb25lbnQsIGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5zZXQoa2V5LCBjb250ZXh0KTtcbn1cbmZ1bmN0aW9uIGdldENvbnRleHQoa2V5KSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuZ2V0KGtleSk7XG59XG5mdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmhhcyhrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4oZXZlbnQpKTtcbiAgICB9XG59XG5cbmNvbnN0IGRpcnR5X2NvbXBvbmVudHMgPSBbXTtcbmNvbnN0IGludHJvcyA9IHsgZW5hYmxlZDogZmFsc2UgfTtcbmNvbnN0IGJpbmRpbmdfY2FsbGJhY2tzID0gW107XG5jb25zdCByZW5kZXJfY2FsbGJhY2tzID0gW107XG5jb25zdCBmbHVzaF9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlc29sdmVkX3Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbmxldCB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG5mdW5jdGlvbiBzY2hlZHVsZV91cGRhdGUoKSB7XG4gICAgaWYgKCF1cGRhdGVfc2NoZWR1bGVkKSB7XG4gICAgICAgIHVwZGF0ZV9zY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlZF9wcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRpY2soKSB7XG4gICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkX3Byb21pc2U7XG59XG5mdW5jdGlvbiBhZGRfcmVuZGVyX2NhbGxiYWNrKGZuKSB7XG4gICAgcmVuZGVyX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFkZF9mbHVzaF9jYWxsYmFjayhmbikge1xuICAgIGZsdXNoX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmxldCBmbHVzaGluZyA9IGZhbHNlO1xuY29uc3Qgc2Vlbl9jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICBpZiAoZmx1c2hpbmcpXG4gICAgICAgIHJldHVybjtcbiAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgZG8ge1xuICAgICAgICAvLyBmaXJzdCwgY2FsbCBiZWZvcmVVcGRhdGUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbaV07XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShjb21wb25lbnQuJCQpO1xuICAgICAgICB9XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5sZW5ndGggPSAwO1xuICAgICAgICB3aGlsZSAoYmluZGluZ19jYWxsYmFja3MubGVuZ3RoKVxuICAgICAgICAgICAgYmluZGluZ19jYWxsYmFja3MucG9wKCkoKTtcbiAgICAgICAgLy8gdGhlbiwgb25jZSBjb21wb25lbnRzIGFyZSB1cGRhdGVkLCBjYWxsXG4gICAgICAgIC8vIGFmdGVyVXBkYXRlIGZ1bmN0aW9ucy4gVGhpcyBtYXkgY2F1c2VcbiAgICAgICAgLy8gc3Vic2VxdWVudCB1cGRhdGVzLi4uXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSByZW5kZXJfY2FsbGJhY2tzW2ldO1xuICAgICAgICAgICAgaWYgKCFzZWVuX2NhbGxiYWNrcy5oYXMoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgLy8gLi4uc28gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBsb29wc1xuICAgICAgICAgICAgICAgIHNlZW5fY2FsbGJhY2tzLmFkZChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW5kZXJfY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gICAgfSB3aGlsZSAoZGlydHlfY29tcG9uZW50cy5sZW5ndGgpO1xuICAgIHdoaWxlIChmbHVzaF9jYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgIGZsdXNoX2NhbGxiYWNrcy5wb3AoKSgpO1xuICAgIH1cbiAgICB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG4gICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICBzZWVuX2NhbGxiYWNrcy5jbGVhcigpO1xufVxuZnVuY3Rpb24gdXBkYXRlKCQkKSB7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICQkLnVwZGF0ZSgpO1xuICAgICAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgICAgICBjb25zdCBkaXJ0eSA9ICQkLmRpcnR5O1xuICAgICAgICAkJC5kaXJ0eSA9IFstMV07XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LnAoJCQuY3R4LCBkaXJ0eSk7XG4gICAgICAgICQkLmFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xuICAgIH1cbn1cblxubGV0IHByb21pc2U7XG5mdW5jdGlvbiB3YWl0KCkge1xuICAgIGlmICghcHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gZGlzcGF0Y2gobm9kZSwgZGlyZWN0aW9uLCBraW5kKSB7XG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudChgJHtkaXJlY3Rpb24gPyAnaW50cm8nIDogJ291dHJvJ30ke2tpbmR9YCkpO1xufVxuY29uc3Qgb3V0cm9pbmcgPSBuZXcgU2V0KCk7XG5sZXQgb3V0cm9zO1xuZnVuY3Rpb24gZ3JvdXBfb3V0cm9zKCkge1xuICAgIG91dHJvcyA9IHtcbiAgICAgICAgcjogMCxcbiAgICAgICAgYzogW10sXG4gICAgICAgIHA6IG91dHJvcyAvLyBwYXJlbnQgZ3JvdXBcbiAgICB9O1xufVxuZnVuY3Rpb24gY2hlY2tfb3V0cm9zKCkge1xuICAgIGlmICghb3V0cm9zLnIpIHtcbiAgICAgICAgcnVuX2FsbChvdXRyb3MuYyk7XG4gICAgfVxuICAgIG91dHJvcyA9IG91dHJvcy5wO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9pbihibG9jaywgbG9jYWwpIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2suaSkge1xuICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICBibG9jay5pKGxvY2FsKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX291dChibG9jaywgbG9jYWwsIGRldGFjaCwgY2FsbGJhY2spIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2subykge1xuICAgICAgICBpZiAob3V0cm9pbmcuaGFzKGJsb2NrKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb3V0cm9pbmcuYWRkKGJsb2NrKTtcbiAgICAgICAgb3V0cm9zLmMucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRldGFjaClcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suZCgxKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYmxvY2subyhsb2NhbCk7XG4gICAgfVxufVxuY29uc3QgbnVsbF90cmFuc2l0aW9uID0geyBkdXJhdGlvbjogMCB9O1xuZnVuY3Rpb24gY3JlYXRlX2luX3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGxldCB0YXNrO1xuICAgIGxldCB1aWQgPSAwO1xuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDAsIDEsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MsIHVpZCsrKTtcbiAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXk7XG4gICAgICAgIGNvbnN0IGVuZF90aW1lID0gc3RhcnRfdGltZSArIGR1cmF0aW9uO1xuICAgICAgICBpZiAodGFzaylcbiAgICAgICAgICAgIHRhc2suYWJvcnQoKTtcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ3N0YXJ0JykpO1xuICAgICAgICB0YXNrID0gbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHRydWUsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCgpIHtcbiAgICAgICAgICAgIGlmIChzdGFydGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbihnbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX291dF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGNvbnN0IGdyb3VwID0gb3V0cm9zO1xuICAgIGdyb3VwLnIgKz0gMTtcbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMSwgMCwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWdyb3VwLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwoZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSAtIHQsIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICBnbygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdvKCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGVuZChyZXNldCkge1xuICAgICAgICAgICAgaWYgKHJlc2V0ICYmIGNvbmZpZy50aWNrKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnRpY2soMSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMsIGludHJvKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHQgPSBpbnRybyA/IDAgOiAxO1xuICAgIGxldCBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gY2xlYXJfYW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluaXQocHJvZ3JhbSwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgZCA9IHByb2dyYW0uYiAtIHQ7XG4gICAgICAgIGR1cmF0aW9uICo9IE1hdGguYWJzKGQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYTogdCxcbiAgICAgICAgICAgIGI6IHByb2dyYW0uYixcbiAgICAgICAgICAgIGQsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXJ0OiBwcm9ncmFtLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBwcm9ncmFtLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICBncm91cDogcHJvZ3JhbS5ncm91cFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbyhiKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICBzdGFydDogbm93KCkgKyBkZWxheSxcbiAgICAgICAgICAgIGJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgcHJvZ3JhbS5ncm91cCA9IG91dHJvcztcbiAgICAgICAgICAgIG91dHJvcy5yICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5ibG9ja3NbaV0gPT09IGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgICAgIGlmICghaW5mby5oYXNDYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaWYgd2UgcHJldmlvdXNseSBoYWQgYSB0aGVuL2NhdGNoIGJsb2NrLCBkZXN0cm95IGl0XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8ucGVuZGluZykge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8ucGVuZGluZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby50aGVuKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSBwcm9taXNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2goaW5mbywgY3R4LCBkaXJ0eSkge1xuICAgIGNvbnN0IGNoaWxkX2N0eCA9IGN0eC5zbGljZSgpO1xuICAgIGNvbnN0IHsgcmVzb2x2ZWQgfSA9IGluZm87XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby50aGVuKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLnZhbHVlXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLmNhdGNoKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLmVycm9yXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpbmZvLmJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl0pO1xuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBjbGFzc2VzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke1N0cmluZyh2YWx1ZSkucmVwbGFjZSgvXCIvZywgJyYjMzQ7JykucmVwbGFjZSgvJy9nLCAnJiMzOTsnKX1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgZXNjYXBlZCA9IHtcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0Oydcbn07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICAgIHJldHVybiBTdHJpbmcoaHRtbCkucmVwbGFjZSgvW1wiJyY8Pl0vZywgbWF0Y2ggPT4gZXNjYXBlZFttYXRjaF0pO1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlc2ApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cywgY29udGV4dCkge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IGNvbnRleHQgfHwgW10pLFxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBpbW1lZGlhdGVseSBkaXNjYXJkZWRcbiAgICAgICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KClcbiAgICAgICAgfTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHsgJCQgfSk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBmbihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMpO1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXI6IChwcm9wcyA9IHt9LCB7ICQkc2xvdHMgPSB7fSwgY29udGV4dCA9IG5ldyBNYXAoKSB9ID0ge30pID0+IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgdGl0bGU6ICcnLCBoZWFkOiAnJywgY3NzOiBuZXcgU2V0KCkgfTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCB7fSwgJCRzbG90cywgY29udGV4dCk7XG4gICAgICAgICAgICBydW5fYWxsKG9uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBBcnJheS5mcm9tKHJlc3VsdC5jc3MpLm1hcChjc3MgPT4gY3NzLmNvZGUpLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IG51bGwgLy8gVE9ET1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZDogcmVzdWx0LnRpdGxlICsgcmVzdWx0LmhlYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICQkcmVuZGVyXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZF9hdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAoYm9vbGVhbiAmJiAhdmFsdWUpKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGAgJHtuYW1lfSR7dmFsdWUgPT09IHRydWUgPyAnJyA6IGA9JHt0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5zdHJpbmdpZnkoZXNjYXBlKHZhbHVlKSkgOiBgXCIke3ZhbHVlfVwiYH1gfWA7XG59XG5mdW5jdGlvbiBhZGRfY2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMgPyBgIGNsYXNzPVwiJHtjbGFzc2VzfVwiYCA6ICcnO1xufVxuXG5mdW5jdGlvbiBiaW5kKGNvbXBvbmVudCwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBpbmRleCA9IGNvbXBvbmVudC4kJC5wcm9wc1tuYW1lXTtcbiAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb21wb25lbnQuJCQuYm91bmRbaW5kZXhdID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudC4kJC5jdHhbaW5kZXhdKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVfY29tcG9uZW50KGJsb2NrKSB7XG4gICAgYmxvY2sgJiYgYmxvY2suYygpO1xufVxuZnVuY3Rpb24gY2xhaW1fY29tcG9uZW50KGJsb2NrLCBwYXJlbnRfbm9kZXMpIHtcbiAgICBibG9jayAmJiBibG9jay5sKHBhcmVudF9ub2Rlcyk7XG59XG5mdW5jdGlvbiBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCB0YXJnZXQsIGFuY2hvciwgY3VzdG9tRWxlbWVudCkge1xuICAgIGNvbnN0IHsgZnJhZ21lbnQsIG9uX21vdW50LCBvbl9kZXN0cm95LCBhZnRlcl91cGRhdGUgfSA9IGNvbXBvbmVudC4kJDtcbiAgICBmcmFnbWVudCAmJiBmcmFnbWVudC5tKHRhcmdldCwgYW5jaG9yKTtcbiAgICBpZiAoIWN1c3RvbUVsZW1lbnQpIHtcbiAgICAgICAgLy8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld19vbl9kZXN0cm95ID0gb25fbW91bnQubWFwKHJ1bikuZmlsdGVyKGlzX2Z1bmN0aW9uKTtcbiAgICAgICAgICAgIGlmIChvbl9kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgb25fZGVzdHJveS5wdXNoKC4uLm5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEVkZ2UgY2FzZSAtIGNvbXBvbmVudCB3YXMgZGVzdHJveWVkIGltbWVkaWF0ZWx5LFxuICAgICAgICAgICAgICAgIC8vIG1vc3QgbGlrZWx5IGFzIGEgcmVzdWx0IG9mIGEgYmluZGluZyBpbml0aWFsaXNpbmdcbiAgICAgICAgICAgICAgICBydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC4kJC5vbl9tb3VudCA9IFtdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2NvbXBvbmVudChjb21wb25lbnQsIGRldGFjaGluZykge1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkO1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBydW5fYWxsKCQkLm9uX2Rlc3Ryb3kpO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5kKGRldGFjaGluZyk7XG4gICAgICAgIC8vIFRPRE8gbnVsbCBvdXQgb3RoZXIgcmVmcywgaW5jbHVkaW5nIGNvbXBvbmVudC4kJCAoYnV0IG5lZWQgdG9cbiAgICAgICAgLy8gcHJlc2VydmUgZmluYWwgc3RhdGU/KVxuICAgICAgICAkJC5vbl9kZXN0cm95ID0gJCQuZnJhZ21lbnQgPSBudWxsO1xuICAgICAgICAkJC5jdHggPSBbXTtcbiAgICB9XG59XG5mdW5jdGlvbiBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSkge1xuICAgIGlmIChjb21wb25lbnQuJCQuZGlydHlbMF0gPT09IC0xKSB7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICBzY2hlZHVsZV91cGRhdGUoKTtcbiAgICAgICAgY29tcG9uZW50LiQkLmRpcnR5LmZpbGwoMCk7XG4gICAgfVxuICAgIGNvbXBvbmVudC4kJC5kaXJ0eVsoaSAvIDMxKSB8IDBdIHw9ICgxIDw8IChpICUgMzEpKTtcbn1cbmZ1bmN0aW9uIGluaXQoY29tcG9uZW50LCBvcHRpb25zLCBpbnN0YW5jZSwgY3JlYXRlX2ZyYWdtZW50LCBub3RfZXF1YWwsIHByb3BzLCBkaXJ0eSA9IFstMV0pIHtcbiAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQgPSB7XG4gICAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgICBjdHg6IG51bGwsXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgb25fZGlzY29ubmVjdDogW10sXG4gICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICBjb250ZXh0OiBuZXcgTWFwKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBvcHRpb25zLmNvbnRleHQgfHwgW10pLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlXG4gICAgfTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gY2hpbGRyZW4ob3B0aW9ucy50YXJnZXQpO1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50Lmwobm9kZXMpO1xuICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChkZXRhY2gpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5pbnRybylcbiAgICAgICAgICAgIHRyYW5zaXRpb25faW4oY29tcG9uZW50LiQkLmZyYWdtZW50KTtcbiAgICAgICAgbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgb3B0aW9ucy50YXJnZXQsIG9wdGlvbnMuYW5jaG9yLCBvcHRpb25zLmN1c3RvbUVsZW1lbnQpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgY29uc3QgeyBvbl9tb3VudCB9ID0gdGhpcy4kJDtcbiAgICAgICAgICAgIHRoaXMuJCQub25fZGlzY29ubmVjdCA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJC5zbG90dGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuJCQuc2xvdHRlZFtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgX29sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpc1thdHRyXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QpO1xuICAgICAgICB9XG4gICAgICAgICRkZXN0cm95KCkge1xuICAgICAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRPRE8gc2hvdWxkIHRoaXMgZGVsZWdhdGUgdG8gYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgJHNldCgkJHByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuJCRzZXQoJCRwcm9wcyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cy4gVXNlZCB3aGVuIGRldj1mYWxzZS5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50IHtcbiAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgIHRoaXMuJGRlc3Ryb3kgPSBub29wO1xuICAgIH1cbiAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSA9IFtdKSk7XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJHNldCgkJHByb3BzKSB7XG4gICAgICAgIGlmICh0aGlzLiQkc2V0ICYmICFpc19lbXB0eSgkJHByb3BzKSkge1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuJCRzZXQoJCRwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hfZGV2KHR5cGUsIGRldGFpbCkge1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KHR5cGUsIE9iamVjdC5hc3NpZ24oeyB2ZXJzaW9uOiAnMy4zOC4yJyB9LCBkZXRhaWwpKSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfZGV2KHRhcmdldCwgbm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUgfSk7XG4gICAgYXBwZW5kKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBkZXRhY2hfZGV2KG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZScsIHsgbm9kZSB9KTtcbiAgICBkZXRhY2gobm9kZSk7XG59XG5mdW5jdGlvbiBkZXRhY2hfYmV0d2Vlbl9kZXYoYmVmb3JlLCBhZnRlcikge1xuICAgIHdoaWxlIChiZWZvcmUubmV4dFNpYmxpbmcgJiYgYmVmb3JlLm5leHRTaWJsaW5nICE9PSBhZnRlcikge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2JlZm9yZV9kZXYoYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYWZ0ZXIucHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYWZ0ZXIucHJldmlvdXNTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYWZ0ZXJfZGV2KGJlZm9yZSkge1xuICAgIHdoaWxlIChiZWZvcmUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxpc3Rlbl9kZXYobm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMsIGhhc19wcmV2ZW50X2RlZmF1bHQsIGhhc19zdG9wX3Byb3BhZ2F0aW9uKSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gb3B0aW9ucyA9PT0gdHJ1ZSA/IFsnY2FwdHVyZSddIDogb3B0aW9ucyA/IEFycmF5LmZyb20oT2JqZWN0LmtleXMob3B0aW9ucykpIDogW107XG4gICAgaWYgKGhhc19wcmV2ZW50X2RlZmF1bHQpXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdwcmV2ZW50RGVmYXVsdCcpO1xuICAgIGlmIChoYXNfc3RvcF9wcm9wYWdhdGlvbilcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3N0b3BQcm9wYWdhdGlvbicpO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NQWRkRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICBjb25zdCBkaXNwb3NlID0gbGlzdGVuKG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gYXR0cl9kZXYobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlQXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUgfSk7XG4gICAgZWxzZVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldEF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlLCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHByb3BfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGVbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRQcm9wZXJ0eScsIHsgbm9kZSwgcHJvcGVydHksIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gZGF0YXNldF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZS5kYXRhc2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YXNldCcsIHsgbm9kZSwgcHJvcGVydHksIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfZGV2KHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YScsIHsgbm9kZTogdGV4dCwgZGF0YSB9KTtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfZWFjaF9hcmd1bWVudChhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgJiYgIShhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgJ2xlbmd0aCcgaW4gYXJnKSkge1xuICAgICAgICBsZXQgbXNnID0gJ3sjZWFjaH0gb25seSBpdGVyYXRlcyBvdmVyIGFycmF5LWxpa2Ugb2JqZWN0cy4nO1xuICAgICAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBhcmcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGFyZykge1xuICAgICAgICAgICAgbXNnICs9ICcgWW91IGNhbiB1c2UgYSBzcHJlYWQgdG8gY29udmVydCB0aGlzIGl0ZXJhYmxlIGludG8gYW4gYXJyYXkuJztcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zbG90cyhuYW1lLCBzbG90LCBrZXlzKSB7XG4gICAgZm9yIChjb25zdCBzbG90X2tleSBvZiBPYmplY3Qua2V5cyhzbG90KSkge1xuICAgICAgICBpZiAoIX5rZXlzLmluZGV4T2Yoc2xvdF9rZXkpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYDwke25hbWV9PiByZWNlaXZlZCBhbiB1bmV4cGVjdGVkIHNsb3QgXCIke3Nsb3Rfa2V5fVwiLmApO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cyB3aXRoIHNvbWUgbWlub3IgZGV2LWVuaGFuY2VtZW50cy4gVXNlZCB3aGVuIGRldj10cnVlLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnREZXYgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zIHx8ICghb3B0aW9ucy50YXJnZXQgJiYgIW9wdGlvbnMuJCRpbmxpbmUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIndGFyZ2V0JyBpcyBhIHJlcXVpcmVkIG9wdGlvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcigpO1xuICAgIH1cbiAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuJGRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy4kZGVzdHJveSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29tcG9uZW50IHdhcyBhbHJlYWR5IGRlc3Ryb3llZCcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJGNhcHR1cmVfc3RhdGUoKSB7IH1cbiAgICAkaW5qZWN0X3N0YXRlKCkgeyB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgdG8gY3JlYXRlIHN0cm9uZ2x5IHR5cGVkIFN2ZWx0ZSBjb21wb25lbnRzLlxuICogVGhpcyBvbmx5IGV4aXN0cyBmb3IgdHlwaW5nIHB1cnBvc2VzIGFuZCBzaG91bGQgYmUgdXNlZCBpbiBgLmQudHNgIGZpbGVzLlxuICpcbiAqICMjIyBFeGFtcGxlOlxuICpcbiAqIFlvdSBoYXZlIGNvbXBvbmVudCBsaWJyYXJ5IG9uIG5wbSBjYWxsZWQgYGNvbXBvbmVudC1saWJyYXJ5YCwgZnJvbSB3aGljaFxuICogeW91IGV4cG9ydCBhIGNvbXBvbmVudCBjYWxsZWQgYE15Q29tcG9uZW50YC4gRm9yIFN2ZWx0ZStUeXBlU2NyaXB0IHVzZXJzLFxuICogeW91IHdhbnQgdG8gcHJvdmlkZSB0eXBpbmdzLiBUaGVyZWZvcmUgeW91IGNyZWF0ZSBhIGBpbmRleC5kLnRzYDpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBTdmVsdGVDb21wb25lbnRUeXBlZCB9IGZyb20gXCJzdmVsdGVcIjtcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkPHtmb286IHN0cmluZ30+IHt9XG4gKiBgYGBcbiAqIFR5cGluZyB0aGlzIG1ha2VzIGl0IHBvc3NpYmxlIGZvciBJREVzIGxpa2UgVlMgQ29kZSB3aXRoIHRoZSBTdmVsdGUgZXh0ZW5zaW9uXG4gKiB0byBwcm92aWRlIGludGVsbGlzZW5zZSBhbmQgdG8gdXNlIHRoZSBjb21wb25lbnQgbGlrZSB0aGlzIGluIGEgU3ZlbHRlIGZpbGVcbiAqIHdpdGggVHlwZVNjcmlwdDpcbiAqIGBgYHN2ZWx0ZVxuICogPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAqIFx0aW1wb3J0IHsgTXlDb21wb25lbnQgfSBmcm9tIFwiY29tcG9uZW50LWxpYnJhcnlcIjtcbiAqIDwvc2NyaXB0PlxuICogPE15Q29tcG9uZW50IGZvbz17J2Jhcid9IC8+XG4gKiBgYGBcbiAqXG4gKiAjIyMjIFdoeSBub3QgbWFrZSB0aGlzIHBhcnQgb2YgYFN2ZWx0ZUNvbXBvbmVudChEZXYpYD9cbiAqIEJlY2F1c2VcbiAqIGBgYHRzXG4gKiBjbGFzcyBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudDx7Zm9vOiBzdHJpbmd9PiB7fVxuICogY29uc3QgY29tcG9uZW50OiB0eXBlb2YgU3ZlbHRlQ29tcG9uZW50ID0gQVN1YmNsYXNzT2ZTdmVsdGVDb21wb25lbnQ7XG4gKiBgYGBcbiAqIHdpbGwgdGhyb3cgYSB0eXBlIGVycm9yLCBzbyB3ZSBuZWVkIHRvIHNlcGVyYXRlIHRoZSBtb3JlIHN0cmljdGx5IHR5cGVkIGNsYXNzLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnRUeXBlZCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudERldiB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsb29wX2d1YXJkKHRpbWVvdXQpIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydCA+IHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5maW5pdGUgbG9vcCBkZXRlY3RlZCcpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgSHRtbFRhZywgU3ZlbHRlQ29tcG9uZW50LCBTdmVsdGVDb21wb25lbnREZXYsIFN2ZWx0ZUNvbXBvbmVudFR5cGVkLCBTdmVsdGVFbGVtZW50LCBhY3Rpb25fZGVzdHJveWVyLCBhZGRfYXR0cmlidXRlLCBhZGRfY2xhc3NlcywgYWRkX2ZsdXNoX2NhbGxiYWNrLCBhZGRfbG9jYXRpb24sIGFkZF9yZW5kZXJfY2FsbGJhY2ssIGFkZF9yZXNpemVfbGlzdGVuZXIsIGFkZF90cmFuc2Zvcm0sIGFmdGVyVXBkYXRlLCBhcHBlbmQsIGFwcGVuZF9kZXYsIGFzc2lnbiwgYXR0ciwgYXR0cl9kZXYsIGF0dHJpYnV0ZV90b19vYmplY3QsIGJlZm9yZVVwZGF0ZSwgYmluZCwgYmluZGluZ19jYWxsYmFja3MsIGJsYW5rX29iamVjdCwgYnViYmxlLCBjaGVja19vdXRyb3MsIGNoaWxkcmVuLCBjbGFpbV9jb21wb25lbnQsIGNsYWltX2VsZW1lbnQsIGNsYWltX3NwYWNlLCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjcmVhdGVFdmVudERpc3BhdGNoZXIsIGNyZWF0ZV9hbmltYXRpb24sIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24sIGNyZWF0ZV9jb21wb25lbnQsIGNyZWF0ZV9pbl90cmFuc2l0aW9uLCBjcmVhdGVfb3V0X3RyYW5zaXRpb24sIGNyZWF0ZV9zbG90LCBjcmVhdGVfc3NyX2NvbXBvbmVudCwgY3VycmVudF9jb21wb25lbnQsIGN1c3RvbV9ldmVudCwgZGF0YXNldF9kZXYsIGRlYnVnLCBkZXN0cm95X2Jsb2NrLCBkZXN0cm95X2NvbXBvbmVudCwgZGVzdHJveV9lYWNoLCBkZXRhY2gsIGRldGFjaF9hZnRlcl9kZXYsIGRldGFjaF9iZWZvcmVfZGV2LCBkZXRhY2hfYmV0d2Vlbl9kZXYsIGRldGFjaF9kZXYsIGRpcnR5X2NvbXBvbmVudHMsIGRpc3BhdGNoX2RldiwgZWFjaCwgZWxlbWVudCwgZWxlbWVudF9pcywgZW1wdHksIGVzY2FwZSwgZXNjYXBlZCwgZXhjbHVkZV9pbnRlcm5hbF9wcm9wcywgZml4X2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfcG9zaXRpb24sIGZsdXNoLCBnZXRDb250ZXh0LCBnZXRfYmluZGluZ19ncm91cF92YWx1ZSwgZ2V0X2N1cnJlbnRfY29tcG9uZW50LCBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzLCBnZXRfc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0LCBnZXRfc3ByZWFkX29iamVjdCwgZ2V0X3NwcmVhZF91cGRhdGUsIGdldF9zdG9yZV92YWx1ZSwgZ2xvYmFscywgZ3JvdXBfb3V0cm9zLCBoYW5kbGVfcHJvbWlzZSwgaGFzQ29udGV4dCwgaGFzX3Byb3AsIGlkZW50aXR5LCBpbml0LCBpbnNlcnQsIGluc2VydF9kZXYsIGludHJvcywgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIsIGlzX2NsaWVudCwgaXNfY3Jvc3NvcmlnaW4sIGlzX2VtcHR5LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3RvcF9wcm9wYWdhdGlvbiwgc3Vic2NyaWJlLCBzdmdfZWxlbWVudCwgdGV4dCwgdGljaywgdGltZV9yYW5nZXNfdG9fYXJyYXksIHRvX251bWJlciwgdG9nZ2xlX2NsYXNzLCB0cmFuc2l0aW9uX2luLCB0cmFuc2l0aW9uX291dCwgdXBkYXRlX2F3YWl0X2Jsb2NrX2JyYW5jaCwgdXBkYXRlX2tleWVkX2VhY2gsIHVwZGF0ZV9zbG90LCB1cGRhdGVfc2xvdF9zcHJlYWQsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHhsaW5rX2F0dHIgfTtcbiIsInZhciBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0ID0gKHVuZGVmaW5lZCAmJiB1bmRlZmluZWQuX19jbGFzc1ByaXZhdGVGaWVsZFNldCkgfHwgZnVuY3Rpb24gKHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XG59O1xudmFyIF9fY2xhc3NQcml2YXRlRmllbGRHZXQgPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KSB8fCBmdW5jdGlvbiAocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XG59O1xudmFyIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBfbG9jYWwsIF9zZXNzaW9uLCBfYSQyO1xuY2xhc3MgU3RvcmFnZUZhY3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHN0b3JhZ2UpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvQ2xhc3Nlcy9Qcml2YXRlX2NsYXNzX2ZpZWxkc1xuICAgICAgICBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZS5zZXQodGhpcywgdm9pZCAwKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVpZCA9IG5ldyBEYXRlKCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSh1aWQsIHVpZCk7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGUgPSBzdG9yYWdlLmdldEl0ZW0odWlkKSA9PSB1aWQ7XG4gICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0odWlkKTtcbiAgICAgICAgICAgIGlmIChhdmFpbGFibGUpXG4gICAgICAgICAgICAgICAgX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgc3RvcmFnZSwgXCJmXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBzdG9yYWdlIGlzIGF2YWlsYWJsZS5cbiAgICAgKi9cbiAgICBpc0F2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGVcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hc3NpZ25tZW50LFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybixcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAtLVxuICAgICAgICAtIHdlJ3JlIHVzaW5nIHRoZSBgdHJ5YCB0byBoYW5kbGUgYW55dGhpbmcgYmFkIGhhcHBlbmluZ1xuICAgICAgICAtIEpTT04ucGFyc2UgcmV0dXJucyBhbiBgYW55YCwgd2UgcmVhbGx5IGFyZSByZXR1cm5pbmcgYW4gYGFueWBcbiAgICAqL1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGFuIGl0ZW0gZnJvbSBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICovXG4gICAgZ2V0KGtleSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSwgZXhwaXJlcyB9ID0gSlNPTi5wYXJzZShfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LmdldEl0ZW0oa2V5KSA/PyAnJyk7XG4gICAgICAgICAgICAvLyBpcyB0aGlzIGl0ZW0gaGFzIHBhc3NlZCBpdHMgc2VsbC1ieS1kYXRlLCByZW1vdmUgaXRcbiAgICAgICAgICAgIGlmIChleHBpcmVzICYmIG5ldyBEYXRlKCkgPiBuZXcgRGF0ZShleHBpcmVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKGtleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qIGVzbGludC1lbmFibGVcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hc3NpZ25tZW50LFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVybixcbiAgICAgICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICovXG4gICAgLyoqXG4gICAgICogU2F2ZSBhIHZhbHVlIHRvIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgZGF0YSB0byBzYXZlXG4gICAgICogQHBhcmFtIGV4cGlyZXMgLSBvcHRpb25hbCBkYXRlIG9uIHdoaWNoIHRoaXMgZGF0YSB3aWxsIGV4cGlyZVxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlLCBleHBpcmVzKSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGV4cGlyZXMsXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGl0ZW0gZnJvbSBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICovXG4gICAgcmVtb3ZlKGtleSkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5yZW1vdmVJdGVtKGtleSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGl0ZW1zIGZyb20gc3RvcmFnZS5cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uY2xlYXIoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYW4gaXRlbSBmcm9tIHN0b3JhZ2UgaW4gaXRzIHJhdyBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqL1xuICAgIGdldFJhdyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uZ2V0SXRlbShrZXkpID8/IG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNhdmUgYSByYXcgdmFsdWUgdG8gc3RvcmFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAgICAgKi9cbiAgICBzZXRSYXcoa2V5LCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIH1cbn1cbl9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogTWFuYWdlcyB1c2luZyBgbG9jYWxTdG9yYWdlYCBhbmQgYHNlc3Npb25TdG9yYWdlYC5cbiAqXG4gKiBIYXMgYSBmZXcgYWR2YW50YWdlcyBvdmVyIHRoZSBuYXRpdmUgQVBJLCBpbmNsdWRpbmdcbiAqIC0gZmFpbGluZyBncmFjZWZ1bGx5IGlmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZVxuICogLSB5b3UgY2FuIHNhdmUgYW5kIHJldHJpZXZlIGFueSBKU09OYWJsZSBkYXRhXG4gKlxuICogQWxsIG1ldGhvZHMgYXJlIGF2YWlsYWJsZSBmb3IgYm90aCBgbG9jYWxTdG9yYWdlYCBhbmQgYHNlc3Npb25TdG9yYWdlYC5cbiAqL1xuY29uc3Qgc3RvcmFnZSA9IG5ldyAoX2EkMiA9IGNsYXNzIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBfbG9jYWwuc2V0KHRoaXMsIHZvaWQgMCk7XG4gICAgICAgICAgICBfc2Vzc2lvbi5zZXQodGhpcywgdm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjcmVhdGluZyB0aGUgaW5zdGFuY2UgcmVxdWlyZXMgdGVzdGluZyB0aGUgbmF0aXZlIGltcGxlbWVudGF0aW9uXG4gICAgICAgIC8vIHdoaWNoIGlzIGJsb2NraW5nLiB0aGVyZWZvcmUsIG9ubHkgY3JlYXRlIG5ldyBpbnN0YW5jZXMgb2YgdGhlIGZhY3RvcnlcbiAgICAgICAgLy8gd2hlbiBpdCdzIGFjY2Vzc2VkIGkuZS4gd2Uga25vdyB3ZSdyZSBnb2luZyB0byB1c2UgaXRcbiAgICAgICAgZ2V0IGxvY2FsKCkge1xuICAgICAgICAgICAgcmV0dXJuIChfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHRoaXMsIF9sb2NhbCwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfbG9jYWwsIFwiZlwiKSB8fCBuZXcgU3RvcmFnZUZhY3RvcnkobG9jYWxTdG9yYWdlKSwgXCJmXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgc2Vzc2lvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAoX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfc2Vzc2lvbiwgX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfc2Vzc2lvbiwgXCJmXCIpIHx8IG5ldyBTdG9yYWdlRmFjdG9yeShzZXNzaW9uU3RvcmFnZSksIFwiZlwiKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9sb2NhbCA9IG5ldyBXZWFrTWFwKCksXG4gICAgX3Nlc3Npb24gPSBuZXcgV2Vha01hcCgpLFxuICAgIF9hJDIpKCk7XG5cbi8qKlxuICogWW91IGNhbiBvbmx5IHN1YnNjcmliZSB0byB0ZWFtcyBmcm9tIHRoaXMgbGlzdC5cbiAqIEFkZCB5b3VyIHRlYW0gbmFtZSBiZWxvdyB0byBzdGFydCBsb2dnaW5nLlxuICpcbiAqIE1ha2Ugc3VyZSB5b3VyIGxhYmVsIGhhcyBhIGNvbnRyYXN0IHJhdGlvIG9mIDQuNSBvciBtb3JlLlxuICogKi9cbmNvbnN0IHRlYW1zID0ge1xuICAgIGNvbW1vbjoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzA1Mjk2MicsXG4gICAgICAgIGZvbnQ6ICcjZmZmZmZmJyxcbiAgICB9LFxuICAgIGNvbW1lcmNpYWw6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyM3N0VFQUEnLFxuICAgICAgICBmb250OiAnIzAwNDQwMCcsXG4gICAgfSxcbiAgICBjbXA6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGRjZCQjUnLFxuICAgICAgICBmb250OiAnIzJGMDQwNCcsXG4gICAgfSxcbiAgICBkb3Rjb206IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMwMDAwMDAnLFxuICAgICAgICBmb250OiAnI2ZmNzMwMCcsXG4gICAgfSxcbiAgICBkZXNpZ246IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMxODVFMzYnLFxuICAgICAgICBmb250OiAnI0ZGRjRGMicsXG4gICAgfSxcbiAgICB0eDoge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnIzJGNEY0RicsXG4gICAgICAgIGZvbnQ6ICcjRkZGRkZGJyxcbiAgICB9LFxufTtcblxuLyoqXG4gKlxuICogSGFuZGxlcyB0ZWFtLWJhc2VkIGxvZ2dpbmcgdG8gdGhlIGJyb3dzZXIgY29uc29sZVxuICpcbiAqIFByZXZlbnRzIGEgcHJvbGlmZXJhdGlvbiBvZiBjb25zb2xlLmxvZyBpbiBjbGllbnQtc2lkZVxuICogY29kZS5cbiAqXG4gKiBTdWJzY3JpYmluZyB0byBsb2dzIHJlbGllcyBvbiBMb2NhbFN0b3JhZ2VcbiAqL1xudmFyIF9hJDE7XG5jb25zdCBLRVkgPSAnZ3UubG9nZ2VyJztcbmNvbnN0IHRlYW1Db2xvdXJzID0gdGVhbXM7XG5jb25zdCBzdHlsZSA9ICh0ZWFtKSA9PiB7XG4gICAgY29uc3QgeyBiYWNrZ3JvdW5kLCBmb250IH0gPSB0ZWFtQ29sb3Vyc1t0ZWFtXTtcbiAgICByZXR1cm4gYGJhY2tncm91bmQ6ICR7YmFja2dyb3VuZH07IGNvbG9yOiAke2ZvbnR9OyBwYWRkaW5nOiAycHggM3B4OyBib3JkZXItcmFkaXVzOjNweGA7XG59O1xuLyoqXG4gKiBSdW5zIGluIGFsbCBlbnZpcm9ubWVudHMsIGlmIGxvY2FsIHN0b3JhZ2UgdmFsdWVzIGFyZSBzZXQuXG4gKi9cbmNvbnN0IGxvZyA9ICh0ZWFtLCAuLi5hcmdzKSA9PiB7XG4gICAgLy8gVE9ETyBhZGQgY2hlY2sgZm9yIGxvY2FsU3RvcmFnZVxuICAgIGlmICghKHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSkgfHwgJycpLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgc3R5bGVzID0gW3N0eWxlKCdjb21tb24nKSwgJycsIHN0eWxlKHRlYW0pLCAnJ107XG4gICAgY29uc29sZS5sb2coYCVjQGd1YXJkaWFuJWMgJWMke3RlYW19JWNgLCAuLi5zdHlsZXMsIC4uLmFyZ3MpO1xufTtcbi8qKlxuICogU3Vic2NyaWJlIHRvIGEgdGVhbeKAmXMgbG9nXG4gKiBAcGFyYW0gdGVhbSB0aGUgdGVhbeKAmXMgdW5pcXVlIElEXG4gKi9cbmNvbnN0IHN1YnNjcmliZVRvID0gKHRlYW0pID0+IHtcbiAgICBjb25zdCB0ZWFtU3Vic2NyaXB0aW9ucyA9IHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSlcbiAgICAgICAgPyBzdG9yYWdlLmxvY2FsLmdldChLRVkpLnNwbGl0KCcsJylcbiAgICAgICAgOiBbXTtcbiAgICBpZiAoIXRlYW1TdWJzY3JpcHRpb25zLmluY2x1ZGVzKHRlYW0pKVxuICAgICAgICB0ZWFtU3Vic2NyaXB0aW9ucy5wdXNoKHRlYW0pO1xuICAgIHN0b3JhZ2UubG9jYWwuc2V0KEtFWSwgdGVhbVN1YnNjcmlwdGlvbnMuam9pbignLCcpKTtcbiAgICBsb2codGVhbSwgJ/CflJQgU3Vic2NyaWJlZCwgaGVsbG8hJyk7XG59O1xuLyoqXG4gKiBVbnN1YnNjcmliZSB0byBhIHRlYW3igJlzIGxvZ1xuICogQHBhcmFtIHRlYW0gdGhlIHRlYW3igJlzIHVuaXF1ZSBJRFxuICovXG5jb25zdCB1bnN1YnNjcmliZUZyb20gPSAodGVhbSkgPT4ge1xuICAgIGxvZyh0ZWFtLCAn8J+UlSBVbnN1YnNjcmliZWQsIGdvb2QtYnllIScpO1xuICAgIGNvbnN0IHRlYW1TdWJzY3JpcHRpb25zID0gc3RvcmFnZS5sb2NhbC5nZXQoS0VZKVxuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAuZmlsdGVyKCh0KSA9PiB0ICE9PSB0ZWFtKTtcbiAgICBzdG9yYWdlLmxvY2FsLnNldChLRVksIHRlYW1TdWJzY3JpcHRpb25zLmpvaW4oJywnKSk7XG59O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5ndWFyZGlhbiB8fCAod2luZG93Lmd1YXJkaWFuID0ge30pO1xuICAgIChfYSQxID0gd2luZG93Lmd1YXJkaWFuKS5sb2dnZXIgfHwgKF9hJDEubG9nZ2VyID0ge1xuICAgICAgICBzdWJzY3JpYmVUbyxcbiAgICAgICAgdW5zdWJzY3JpYmVGcm9tLFxuICAgICAgICB0ZWFtczogKCkgPT4gT2JqZWN0LmtleXModGVhbUNvbG91cnMpLFxuICAgIH0pO1xufVxuXG5sZXQgY3VycmVudEZyYW1ld29yaztcbmNvbnN0IHNldEN1cnJlbnRGcmFtZXdvcmsgPSAoZnJhbWV3b3JrKSA9PiB7XG4gICAgbG9nKCdjbXAnLCBgRnJhbWV3b3JrIHNldCB0byAke2ZyYW1ld29ya31gKTtcbiAgICBjdXJyZW50RnJhbWV3b3JrID0gZnJhbWV3b3JrO1xufTtcbmNvbnN0IGdldEN1cnJlbnRGcmFtZXdvcmsgPSAoKSA9PiBjdXJyZW50RnJhbWV3b3JrO1xuXG5jb25zdCBtYXJrID0gKGxhYmVsKSA9PiB7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlPy5tYXJrPy4obGFiZWwpO1xuICAgIHtcbiAgICAgICAgbG9nKCdjbXAnLCAnW2V2ZW50XScsIGxhYmVsKTtcbiAgICB9XG59O1xuXG5jb25zdCBpc1NlcnZlclNpZGUgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJztcbmNvbnN0IHNlcnZlclNpZGVXYXJuID0gKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybignVGhpcyBpcyBhIHNlcnZlci1zaWRlIHZlcnNpb24gb2YgdGhlIEBndWFyZGlhbi9jb25zZW50LW1hbmFnZW1lbnQtcGxhdGZvcm0nLCAnTm8gY29uc2VudCBzaWduYWxzIHdpbGwgYmUgcmVjZWl2ZWQuJyk7XG59O1xuY29uc3Qgc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4gPSAoYXJnKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc2VydmVyU2lkZVdhcm4oKTtcbiAgICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xufTtcbmNvbnN0IGNtcCQxID0ge1xuICAgIF9fZGlzYWJsZTogc2VydmVyU2lkZVdhcm4sXG4gICAgX19lbmFibGU6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbiAgICBfX2lzRGlzYWJsZWQ6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbiAgICBoYXNJbml0aWFsaXNlZDogc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4oZmFsc2UpLFxuICAgIGluaXQ6IHNlcnZlclNpZGVXYXJuLFxuICAgIHNob3dQcml2YWN5TWFuYWdlcjogc2VydmVyU2lkZVdhcm4sXG4gICAgdmVyc2lvbjogJ24vYScsXG4gICAgd2lsbFNob3dQcml2YWN5TWVzc2FnZTogc2VydmVyU2lkZVdhcm5BbmRSZXR1cm4oUHJvbWlzZS5yZXNvbHZlKGZhbHNlKSksXG4gICAgd2lsbFNob3dQcml2YWN5TWVzc2FnZVN5bmM6IHNlcnZlclNpZGVXYXJuQW5kUmV0dXJuKGZhbHNlKSxcbn07XG5jb25zdCBvbkNvbnNlbnRDaGFuZ2UkMiA9ICgpID0+IHtcbiAgICByZXR1cm4gc2VydmVyU2lkZVdhcm4oKTtcbn07XG5jb25zdCBnZXRDb25zZW50Rm9yJDIgPSAodmVuZG9yLCBjb25zZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNlcnZlci1zaWRlIGNhbGwgZm9yIGdldENvbnNlbnRGb3IoJHt2ZW5kb3J9LCAke0pTT04uc3RyaW5naWZ5KGNvbnNlbnQpfSlgLCAnZ2V0Q29uc2VudEZvciB3aWxsIGFsd2F5cyByZXR1cm4gZmFsc2Ugc2VydmVyLXNpZGUnKTtcbiAgICBzZXJ2ZXJTaWRlV2FybigpO1xuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmxldCBpc0d1YXJkaWFuO1xuY29uc3QgaXNHdWFyZGlhbkRvbWFpbiA9ICgpID0+IHtcbiAgICBpZiAodHlwZW9mIGlzR3VhcmRpYW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChpc1NlcnZlclNpZGUpIHtcbiAgICAgICAgICAgIGlzR3VhcmRpYW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaXNHdWFyZGlhbiA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0LmVuZHNXaXRoKCcudGhlZ3VhcmRpYW4uY29tJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlzR3VhcmRpYW47XG59O1xuXG5jb25zdCBBQ0NPVU5UX0lEID0gMTI1NztcbmNvbnN0IFBSSVZBQ1lfTUFOQUdFUl9DQ1BBID0gNTQwMjUyO1xuY29uc3QgUFJJVkFDWV9NQU5BR0VSX1RDRlYyID0gMTA2ODQyO1xuY29uc3QgUFJJVkFDWV9NQU5BR0VSX0FVU1RSQUxJQSA9IDU0MDM0MTtcbmNvbnN0IEVORFBPSU5UID0gaXNHdWFyZGlhbkRvbWFpbigpXG4gICAgPyAnaHR0cHM6Ly9zb3VyY2Vwb2ludC50aGVndWFyZGlhbi5jb20nXG4gICAgOiAnaHR0cHM6Ly9jZG4ucHJpdmFjeS1tZ210LmNvbSc7XG5cbmNvbnN0IGFwaSQyID0gKGNvbW1hbmQpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAod2luZG93Ll9fdXNwYXBpKSB7XG4gICAgICAgIHdpbmRvdy5fX3VzcGFwaShjb21tYW5kLCAxLCAocmVzdWx0LCBzdWNjZXNzKSA9PiBzdWNjZXNzXG4gICAgICAgICAgICA/IHJlc29sdmUocmVzdWx0KVxuICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFVuYWJsZSB0byBnZXQgJHtjb21tYW5kfSBkYXRhYCkpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIF9fdXNwYXBpIGZvdW5kIG9uIHdpbmRvdycpKTtcbiAgICB9XG59KTtcbmNvbnN0IGdldFVTUERhdGEkMSA9ICgpID0+IGFwaSQyKCdnZXRVU1BEYXRhJyk7XG5cbmNvbnN0IGdldENvbnNlbnRTdGF0ZSQzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHVzcERhdGEgPSBhd2FpdCBnZXRVU1BEYXRhJDEoKTtcbiAgICBjb25zdCBvcHRlZE91dCA9IHVzcERhdGEudXNwU3RyaW5nLmNoYXJBdCgyKSA9PT0gJ1knO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBlcnNvbmFsaXNlZEFkdmVydGlzaW5nOiAhb3B0ZWRPdXQsXG4gICAgfTtcbn07XG5cbmNvbnN0IGFwaSQxID0gKGNvbW1hbmQpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAod2luZG93Ll9fdXNwYXBpKSB7XG4gICAgICAgIHdpbmRvdy5fX3VzcGFwaShjb21tYW5kLCAxLCAocmVzdWx0LCBzdWNjZXNzKSA9PiBzdWNjZXNzXG4gICAgICAgICAgICA/IHJlc29sdmUocmVzdWx0KVxuICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFVuYWJsZSB0byBnZXQgJHtjb21tYW5kfSBkYXRhYCkpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIF9fdXNwYXBpIGZvdW5kIG9uIHdpbmRvdycpKTtcbiAgICB9XG59KTtcbmNvbnN0IGdldFVTUERhdGEgPSAoKSA9PiBhcGkkMSgnZ2V0VVNQRGF0YScpO1xuXG5jb25zdCBnZXRDb25zZW50U3RhdGUkMiA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB1c3BEYXRhID0gYXdhaXQgZ2V0VVNQRGF0YSgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRvTm90U2VsbDogdXNwRGF0YS51c3BTdHJpbmcuY2hhckF0KDIpID09PSAnWScsXG4gICAgfTtcbn07XG5cbmNvbnN0IGFwaSA9IChjb21tYW5kKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHdpbmRvdy5fX3RjZmFwaSkge1xuICAgICAgICB3aW5kb3cuX190Y2ZhcGkoY29tbWFuZCwgMiwgKHJlc3VsdCwgc3VjY2VzcykgPT4gc3VjY2Vzc1xuICAgICAgICAgICAgPyByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBVbmFibGUgdG8gZ2V0ICR7Y29tbWFuZH0gZGF0YWApKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdObyBfX3RjZmFwaSBmb3VuZCBvbiB3aW5kb3cnKSk7XG4gICAgfVxufSk7XG5jb25zdCBnZXRUQ0RhdGEgPSAoKSA9PiBhcGkoJ2dldFRDRGF0YScpO1xuY29uc3QgZ2V0Q3VzdG9tVmVuZG9yQ29uc2VudHMgPSAoKSA9PiBhcGkoJ2dldEN1c3RvbVZlbmRvckNvbnNlbnRzJyk7XG5cbmNvbnN0IGRlZmF1bHRDb25zZW50cyA9IHtcbiAgICAnMSc6IGZhbHNlLFxuICAgICcyJzogZmFsc2UsXG4gICAgJzMnOiBmYWxzZSxcbiAgICAnNCc6IGZhbHNlLFxuICAgICc1JzogZmFsc2UsXG4gICAgJzYnOiBmYWxzZSxcbiAgICAnNyc6IGZhbHNlLFxuICAgICc4JzogZmFsc2UsXG4gICAgJzknOiBmYWxzZSxcbiAgICAnMTAnOiBmYWxzZSxcbn07XG5jb25zdCBnZXRDb25zZW50U3RhdGUkMSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBbdGNEYXRhLCBjdXN0b21WZW5kb3JzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0VENEYXRhKCksXG4gICAgICAgIGdldEN1c3RvbVZlbmRvckNvbnNlbnRzKCksXG4gICAgXSk7XG4gICAgaWYgKHR5cGVvZiB0Y0RhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRGcmFtZXdvcmsgPSBnZXRDdXJyZW50RnJhbWV3b3JrKCkgPz8gJ3VuZGVmaW5lZCc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gVEMgRGF0YSBmb3VuZCB3aXRoIGN1cnJlbnQgZnJhbWV3b3JrOiAke2N1cnJlbnRGcmFtZXdvcmt9YCk7XG4gICAgfVxuICAgIGNvbnN0IGNvbnNlbnRzID0ge1xuICAgICAgICAuLi5kZWZhdWx0Q29uc2VudHMsXG4gICAgICAgIC4uLnRjRGF0YS5wdXJwb3NlLmNvbnNlbnRzLFxuICAgIH07XG4gICAgY29uc3QgeyBldmVudFN0YXR1cywgZ2RwckFwcGxpZXMsIHRjU3RyaW5nLCBhZGR0bENvbnNlbnQgfSA9IHRjRGF0YTtcbiAgICBjb25zdCB7IGdyYW50cyB9ID0gY3VzdG9tVmVuZG9ycztcbiAgICBjb25zdCB2ZW5kb3JDb25zZW50cyA9IE9iamVjdC5rZXlzKGdyYW50cylcbiAgICAgICAgLnNvcnQoKVxuICAgICAgICAucmVkdWNlKChhY2MsIGN1cikgPT4gKHsgLi4uYWNjLCBbY3VyXTogZ3JhbnRzW2N1cl0udmVuZG9yR3JhbnQgfSksIHt9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25zZW50cyxcbiAgICAgICAgZXZlbnRTdGF0dXMsXG4gICAgICAgIHZlbmRvckNvbnNlbnRzLFxuICAgICAgICBhZGR0bENvbnNlbnQsXG4gICAgICAgIGdkcHJBcHBsaWVzLFxuICAgICAgICB0Y1N0cmluZyxcbiAgICB9O1xufTtcblxuY29uc3QgY2FsbEJhY2tRdWV1ZSA9IFtdO1xuY29uc3QgYXdhaXRpbmdVc2VySW50ZXJhY3Rpb25JblRDRnYyID0gKHN0YXRlKSA9PiBzdGF0ZS50Y2Z2Mj8uZXZlbnRTdGF0dXMgPT09ICdjbXB1aXNob3duJztcbmNvbnN0IGludm9rZUNhbGxiYWNrID0gKGNhbGxiYWNrLCBzdGF0ZSkgPT4ge1xuICAgIGlmIChhd2FpdGluZ1VzZXJJbnRlcmFjdGlvbkluVENGdjIoc3RhdGUpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgc3RhdGVTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSk7XG4gICAgaWYgKHN0YXRlU3RyaW5nICE9PSBjYWxsYmFjay5sYXN0U3RhdGUpIHtcbiAgICAgICAgY2FsbGJhY2suZm4oc3RhdGUpO1xuICAgICAgICBjYWxsYmFjay5sYXN0U3RhdGUgPSBzdGF0ZVN0cmluZztcbiAgICB9XG59O1xuY29uc3QgZ2V0Q29uc2VudFN0YXRlID0gYXN5bmMgKCkgPT4ge1xuICAgIHN3aXRjaCAoZ2V0Q3VycmVudEZyYW1ld29yaygpKSB7XG4gICAgICAgIGNhc2UgJ2F1cyc6XG4gICAgICAgICAgICByZXR1cm4geyBhdXM6IGF3YWl0IGdldENvbnNlbnRTdGF0ZSQzKCkgfTtcbiAgICAgICAgY2FzZSAnY2NwYSc6XG4gICAgICAgICAgICByZXR1cm4geyBjY3BhOiBhd2FpdCBnZXRDb25zZW50U3RhdGUkMigpIH07XG4gICAgICAgIGNhc2UgJ3RjZnYyJzpcbiAgICAgICAgICAgIHJldHVybiB7IHRjZnYyOiBhd2FpdCBnZXRDb25zZW50U3RhdGUkMSgpIH07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIElBQiBjb25zZW50IGZyYW1ld29yayBmb3VuZCBvbiB0aGUgcGFnZScpO1xuICAgIH1cbn07XG5jb25zdCBpbnZva2VDYWxsYmFja3MgPSAoKSA9PiB7XG4gICAgaWYgKGNhbGxCYWNrUXVldWUubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm47XG4gICAgdm9pZCBnZXRDb25zZW50U3RhdGUoKS50aGVuKChzdGF0ZSkgPT4ge1xuICAgICAgICBpZiAoYXdhaXRpbmdVc2VySW50ZXJhY3Rpb25JblRDRnYyKHN0YXRlKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FsbEJhY2tRdWV1ZS5mb3JFYWNoKChjYWxsYmFjaykgPT4gaW52b2tlQ2FsbGJhY2soY2FsbGJhY2ssIHN0YXRlKSk7XG4gICAgfSk7XG59O1xuY29uc3Qgb25Db25zZW50Q2hhbmdlJDEgPSAoY2FsbEJhY2spID0+IHtcbiAgICBjb25zdCBuZXdDYWxsYmFjayA9IHsgZm46IGNhbGxCYWNrIH07XG4gICAgY2FsbEJhY2tRdWV1ZS5wdXNoKG5ld0NhbGxiYWNrKTtcbiAgICB2b2lkIGdldENvbnNlbnRTdGF0ZSgpXG4gICAgICAgIC50aGVuKChjb25zZW50U3RhdGUpID0+IHtcbiAgICAgICAgaW52b2tlQ2FsbGJhY2sobmV3Q2FsbGJhY2ssIGNvbnNlbnRTdGF0ZSk7XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICB9KTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIC0tIHRoaXMgaXMgdGhpcmQgcGFydHkgY29kZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIGZpbGUgKi9cblxuY29uc3Qgc3R1Yl9jY3BhID0gKCkgPT4ge1xuXHQoZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlID0gZmFsc2U7XG5cdFx0dmFyIGMgPSB3aW5kb3c7XG5cdFx0dmFyIHQgPSBkb2N1bWVudDtcblx0XHRmdW5jdGlvbiByKCkge1xuXHRcdFx0aWYgKCFjLmZyYW1lc1snX191c3BhcGlMb2NhdG9yJ10pIHtcblx0XHRcdFx0aWYgKHQuYm9keSkge1xuXHRcdFx0XHRcdHZhciBhID0gdC5ib2R5O1xuXHRcdFx0XHRcdHZhciBlID0gdC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblx0XHRcdFx0XHRlLnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpub25lJztcblx0XHRcdFx0XHRlLm5hbWUgPSAnX191c3BhcGlMb2NhdG9yJztcblx0XHRcdFx0XHRhLmFwcGVuZENoaWxkKGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQociwgNSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cigpO1xuXHRcdGZ1bmN0aW9uIHAoKSB7XG5cdFx0XHR2YXIgYSA9IGFyZ3VtZW50cztcblx0XHRcdF9fdXNwYXBpLmEgPSBfX3VzcGFwaS5hIHx8IFtdO1xuXHRcdFx0aWYgKCFhLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gX191c3BhcGkuYTtcblx0XHRcdH0gZWxzZSBpZiAoYVswXSA9PT0gJ3BpbmcnKSB7XG5cdFx0XHRcdGFbMl0oeyBnZHByQXBwbGllc0dsb2JhbGx5OiBlLCBjbXBMb2FkZWQ6IGZhbHNlIH0sIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X191c3BhcGkuYS5wdXNoKFtdLnNsaWNlLmFwcGx5KGEpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZnVuY3Rpb24gbCh0KSB7XG5cdFx0XHR2YXIgciA9IHR5cGVvZiB0LmRhdGEgPT09ICdzdHJpbmcnO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dmFyIGEgPSByID8gSlNPTi5wYXJzZSh0LmRhdGEpIDogdC5kYXRhO1xuXHRcdFx0XHRpZiAoYS5fX2NtcENhbGwpIHtcblx0XHRcdFx0XHR2YXIgbiA9IGEuX19jbXBDYWxsO1xuXHRcdFx0XHRcdGMuX191c3BhcGkobi5jb21tYW5kLCBuLnBhcmFtZXRlciwgZnVuY3Rpb24gKGEsIGUpIHtcblx0XHRcdFx0XHRcdHZhciBjID0ge1xuXHRcdFx0XHRcdFx0XHRfX2NtcFJldHVybjoge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVyblZhbHVlOiBhLFxuXHRcdFx0XHRcdFx0XHRcdHN1Y2Nlc3M6IGUsXG5cdFx0XHRcdFx0XHRcdFx0Y2FsbElkOiBuLmNhbGxJZCxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0LnNvdXJjZS5wb3N0TWVzc2FnZShyID8gSlNPTi5zdHJpbmdpZnkoYykgOiBjLCAnKicpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChhKSB7fVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIF9fdXNwYXBpICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjLl9fdXNwYXBpID0gcDtcblx0XHRcdF9fdXNwYXBpLm1zZ0hhbmRsZXIgPSBsO1xuXHRcdFx0Yy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbCwgZmFsc2UpO1xuXHRcdH1cblx0fSkoKTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIC0tIHRoaXMgaXMgdGhpcmQgcGFydHkgY29kZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIGZpbGUgKi9cblxuY29uc3Qgc3R1Yl90Y2Z2MiA9ICgpID0+IHtcblx0IShmdW5jdGlvbiAodCkge1xuXHRcdHZhciBlID0ge307XG5cdFx0ZnVuY3Rpb24gbihyKSB7XG5cdFx0XHRpZiAoZVtyXSkgcmV0dXJuIGVbcl0uZXhwb3J0cztcblx0XHRcdHZhciBvID0gKGVbcl0gPSB7IGk6IHIsIGw6ICExLCBleHBvcnRzOiB7fSB9KTtcblx0XHRcdHJldHVybiB0W3JdLmNhbGwoby5leHBvcnRzLCBvLCBvLmV4cG9ydHMsIG4pLCAoby5sID0gITApLCBvLmV4cG9ydHM7XG5cdFx0fVxuXHRcdChuLm0gPSB0KSxcblx0XHRcdChuLmMgPSBlKSxcblx0XHRcdChuLmQgPSBmdW5jdGlvbiAodCwgZSwgcikge1xuXHRcdFx0XHRuLm8odCwgZSkgfHxcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodCwgZSwgeyBlbnVtZXJhYmxlOiAhMCwgZ2V0OiByIH0pO1xuXHRcdFx0fSksXG5cdFx0XHQobi5yID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0J3VuZGVmaW5lZCcgIT0gdHlwZW9mIFN5bWJvbCAmJlxuXHRcdFx0XHRcdFN5bWJvbC50b1N0cmluZ1RhZyAmJlxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LCBTeW1ib2wudG9TdHJpbmdUYWcsIHtcblx0XHRcdFx0XHRcdHZhbHVlOiAnTW9kdWxlJyxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodCwgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiAhMCB9KTtcblx0XHRcdH0pLFxuXHRcdFx0KG4udCA9IGZ1bmN0aW9uICh0LCBlKSB7XG5cdFx0XHRcdGlmICgoMSAmIGUgJiYgKHQgPSBuKHQpKSwgOCAmIGUpKSByZXR1cm4gdDtcblx0XHRcdFx0aWYgKDQgJiBlICYmICdvYmplY3QnID09IHR5cGVvZiB0ICYmIHQgJiYgdC5fX2VzTW9kdWxlKVxuXHRcdFx0XHRcdHJldHVybiB0O1xuXHRcdFx0XHR2YXIgciA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQobi5yKHIpLFxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyLCAnZGVmYXVsdCcsIHtcblx0XHRcdFx0XHRcdGVudW1lcmFibGU6ICEwLFxuXHRcdFx0XHRcdFx0dmFsdWU6IHQsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0MiAmIGUgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHQpXG5cdFx0XHRcdClcblx0XHRcdFx0XHRmb3IgKHZhciBvIGluIHQpXG5cdFx0XHRcdFx0XHRuLmQoXG5cdFx0XHRcdFx0XHRcdHIsXG5cdFx0XHRcdFx0XHRcdG8sXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRbZV07XG5cdFx0XHRcdFx0XHRcdH0uYmluZChudWxsLCBvKSxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiByO1xuXHRcdFx0fSksXG5cdFx0XHQobi5uID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0dmFyIGUgPVxuXHRcdFx0XHRcdHQgJiYgdC5fX2VzTW9kdWxlXG5cdFx0XHRcdFx0XHQ/IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdC5kZWZhdWx0O1xuXHRcdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0XHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdDtcblx0XHRcdFx0XHRcdCAgfTtcblx0XHRcdFx0cmV0dXJuIG4uZChlLCAnYScsIGUpLCBlO1xuXHRcdFx0fSksXG5cdFx0XHQobi5vID0gZnVuY3Rpb24gKHQsIGUpIHtcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LCBlKTtcblx0XHRcdH0pLFxuXHRcdFx0KG4ucCA9ICcnKSxcblx0XHRcdG4oKG4ucyA9IDMpKTtcblx0fSkoW1xuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHR2YXIgciA9IG4oMik7XG5cdFx0XHR0LmV4cG9ydHMgPSAhcihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0NyAhPVxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7XG5cdFx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIDc7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0pLmFcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUpIHtcblx0XHRcdHQuZXhwb3J0cyA9IGZ1bmN0aW9uICh0KSB7XG5cdFx0XHRcdHJldHVybiAnb2JqZWN0JyA9PSB0eXBlb2YgdFxuXHRcdFx0XHRcdD8gbnVsbCAhPT0gdFxuXHRcdFx0XHRcdDogJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdDtcblx0XHRcdH07XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSkge1xuXHRcdFx0dC5leHBvcnRzID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gISF0KCk7XG5cdFx0XHRcdH0gY2F0Y2ggKHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gITA7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0big0KSxcblx0XHRcdFx0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygd2luZG93Ll9fdGNmYXBpKSB7XG5cdFx0XHRcdFx0XHR2YXIgdCxcblx0XHRcdFx0XHRcdFx0ZSA9IFtdLFxuXHRcdFx0XHRcdFx0XHRuID0gd2luZG93LFxuXHRcdFx0XHRcdFx0XHRyID0gbi5kb2N1bWVudDtcblx0XHRcdFx0XHRcdCFuLl9fdGNmYXBpICYmXG5cdFx0XHRcdFx0XHRcdChmdW5jdGlvbiB0KCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBlID0gISFuLmZyYW1lcy5fX3RjZmFwaUxvY2F0b3I7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFlKVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHIuYm9keSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgbyA9IHIuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdChvLnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpub25lJyksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KG8ubmFtZSA9ICdfX3RjZmFwaUxvY2F0b3InKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyLmJvZHkuYXBwZW5kQ2hpbGQobyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Ugc2V0VGltZW91dCh0LCA1KTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gIWU7XG5cdFx0XHRcdFx0XHRcdH0pKCkgJiZcblx0XHRcdFx0XHRcdFx0KChuLl9fdGNmYXBpID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHIgPSBuZXcgQXJyYXkobiksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG8gPSAwO1xuXHRcdFx0XHRcdFx0XHRcdFx0byA8IG47XG5cdFx0XHRcdFx0XHRcdFx0XHRvKytcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0XHRyW29dID0gYXJndW1lbnRzW29dO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghci5sZW5ndGgpIHJldHVybiBlO1xuXHRcdFx0XHRcdFx0XHRcdGlmICgnc2V0R2RwckFwcGxpZXMnID09PSByWzBdKVxuXHRcdFx0XHRcdFx0XHRcdFx0ci5sZW5ndGggPiAzICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDIgPT09IHBhcnNlSW50KHJbMV0sIDEwKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnYm9vbGVhbicgPT0gdHlwZW9mIHJbM10gJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0KCh0ID0gclszXSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdmdW5jdGlvbicgPT0gdHlwZW9mIHJbMl0gJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyWzJdKCdzZXQnLCAhMCkpO1xuXHRcdFx0XHRcdFx0XHRcdGVsc2UgaWYgKCdwaW5nJyA9PT0gclswXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdkcHJBcHBsaWVzOiB0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjbXBMb2FkZWQ6ICExLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcGlWZXJzaW9uOiAnMi4wJyxcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHQnZnVuY3Rpb24nID09IHR5cGVvZiByWzJdICYmIHJbMl0oaSwgITApO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBlLnB1c2gocik7XG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRuLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdFx0XHRcdFx0J21lc3NhZ2UnLFxuXHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICh0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZSA9ICdzdHJpbmcnID09IHR5cGVvZiB0LmRhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHIgPSB7fTtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHIgPSBlID8gSlNPTi5wYXJzZSh0LmRhdGEpIDogdC5kYXRhO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAodCkge31cblx0XHRcdFx0XHRcdFx0XHRcdHZhciBvID0gci5fX3RjZmFwaUNhbGw7XG5cdFx0XHRcdFx0XHRcdFx0XHRvICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG4uX190Y2ZhcGkoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0by5jb21tYW5kLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG8udmVyc2lvbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAobiwgcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIGkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9fdGNmYXBpUmV0dXJuOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuVmFsdWU6IG4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3VjY2Vzczogcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYWxsSWQ6IG8uY2FsbElkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGUgJiYgKGkgPSBKU09OLnN0cmluZ2lmeShpKSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHQuc291cmNlLnBvc3RNZXNzYWdlKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0JyonLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0by5wYXJhbWV0ZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHQhMSxcblx0XHRcdFx0XHRcdFx0KSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbigwKSxcblx0XHRcdFx0byA9IG4oNSkuZixcblx0XHRcdFx0aSA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0YyA9IGkudG9TdHJpbmcsXG5cdFx0XHRcdHUgPSAvXnMqZnVuY3Rpb24gKFteIChdKikvO1xuXHRcdFx0ciAmJlxuXHRcdFx0XHQhKCduYW1lJyBpbiBpKSAmJlxuXHRcdFx0XHRvKGksICduYW1lJywge1xuXHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogITAsXG5cdFx0XHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYy5jYWxsKHRoaXMpLm1hdGNoKHUpWzFdO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAodCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSk7XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0dmFyIHIgPSBuKDApLFxuXHRcdFx0XHRvID0gbig2KSxcblx0XHRcdFx0aSA9IG4oMTApLFxuXHRcdFx0XHRjID0gbigxMSksXG5cdFx0XHRcdHUgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cdFx0XHRlLmYgPSByXG5cdFx0XHRcdD8gdVxuXHRcdFx0XHQ6IGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHRcdFx0XHRpZiAoKGkodCksIChlID0gYyhlLCAhMCkpLCBpKG4pLCBvKSlcblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdSh0LCBlLCBuKTtcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAodCkge31cblx0XHRcdFx0XHRcdGlmICgnZ2V0JyBpbiBuIHx8ICdzZXQnIGluIG4pXG5cdFx0XHRcdFx0XHRcdHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQnKTtcblx0XHRcdFx0XHRcdHJldHVybiAndmFsdWUnIGluIG4gJiYgKHRbZV0gPSBuLnZhbHVlKSwgdDtcblx0XHRcdFx0ICB9O1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbigwKSxcblx0XHRcdFx0byA9IG4oMiksXG5cdFx0XHRcdGkgPSBuKDcpO1xuXHRcdFx0dC5leHBvcnRzID1cblx0XHRcdFx0IXIgJiZcblx0XHRcdFx0IW8oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHQ3ICE9XG5cdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoaSgnZGl2JyksICdhJywge1xuXHRcdFx0XHRcdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gNztcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0pLmFcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHR2YXIgciA9IG4oOCksXG5cdFx0XHRcdG8gPSBuKDEpLFxuXHRcdFx0XHRpID0gci5kb2N1bWVudCxcblx0XHRcdFx0YyA9IG8oaSkgJiYgbyhpLmNyZWF0ZUVsZW1lbnQpO1xuXHRcdFx0dC5leHBvcnRzID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0cmV0dXJuIGMgPyBpLmNyZWF0ZUVsZW1lbnQodCkgOiB7fTtcblx0XHRcdH07XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSwgbikge1xuXHRcdFx0KGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdHZhciBuID0gZnVuY3Rpb24gKHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gdCAmJiB0Lk1hdGggPT0gTWF0aCAmJiB0O1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0LmV4cG9ydHMgPVxuXHRcdFx0XHRcdG4oJ29iamVjdCcgPT0gdHlwZW9mIGdsb2JhbFRoaXMgJiYgZ2xvYmFsVGhpcykgfHxcblx0XHRcdFx0XHRuKCdvYmplY3QnID09IHR5cGVvZiB3aW5kb3cgJiYgd2luZG93KSB8fFxuXHRcdFx0XHRcdG4oJ29iamVjdCcgPT0gdHlwZW9mIHNlbGYgJiYgc2VsZikgfHxcblx0XHRcdFx0XHRuKCdvYmplY3QnID09IHR5cGVvZiBlICYmIGUpIHx8XG5cdFx0XHRcdFx0RnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0XHRcdH0uY2FsbCh0aGlzLCBuKDkpKSk7XG5cdFx0fSxcblx0XHRmdW5jdGlvbiAodCwgZSkge1xuXHRcdFx0dmFyIG47XG5cdFx0XHRuID0gKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9KSgpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0biA9IG4gfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdFx0XHR9IGNhdGNoICh0KSB7XG5cdFx0XHRcdCdvYmplY3QnID09IHR5cGVvZiB3aW5kb3cgJiYgKG4gPSB3aW5kb3cpO1xuXHRcdFx0fVxuXHRcdFx0dC5leHBvcnRzID0gbjtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uICh0LCBlLCBuKSB7XG5cdFx0XHR2YXIgciA9IG4oMSk7XG5cdFx0XHR0LmV4cG9ydHMgPSBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHRpZiAoIXIodCkpIHRocm93IFR5cGVFcnJvcihTdHJpbmcodCkgKyAnIGlzIG5vdCBhbiBvYmplY3QnKTtcblx0XHRcdFx0cmV0dXJuIHQ7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gKHQsIGUsIG4pIHtcblx0XHRcdHZhciByID0gbigxKTtcblx0XHRcdHQuZXhwb3J0cyA9IGZ1bmN0aW9uICh0LCBlKSB7XG5cdFx0XHRcdGlmICghcih0KSkgcmV0dXJuIHQ7XG5cdFx0XHRcdHZhciBuLCBvO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0ZSAmJlxuXHRcdFx0XHRcdCdmdW5jdGlvbicgPT0gdHlwZW9mIChuID0gdC50b1N0cmluZykgJiZcblx0XHRcdFx0XHQhcigobyA9IG4uY2FsbCh0KSkpXG5cdFx0XHRcdClcblx0XHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdFx0aWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIChuID0gdC52YWx1ZU9mKSAmJiAhcigobyA9IG4uY2FsbCh0KSkpKVxuXHRcdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0IWUgJiZcblx0XHRcdFx0XHQnZnVuY3Rpb24nID09IHR5cGVvZiAobiA9IHQudG9TdHJpbmcpICYmXG5cdFx0XHRcdFx0IXIoKG8gPSBuLmNhbGwodCkpKVxuXHRcdFx0XHQpXG5cdFx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcblx0XHRcdH07XG5cdFx0fSxcblx0XSk7XG59O1xuXG5jb25zdCBzdHViID0gKGZyYW1ld29yaykgPT4ge1xuICAgIGlmIChmcmFtZXdvcmsgPT09ICd0Y2Z2MicpXG4gICAgICAgIHN0dWJfdGNmdjIoKTtcbiAgICBlbHNlXG4gICAgICAgIHN0dWJfY2NwYSgpO1xufTtcblxubGV0IHJlc29sdmVXaWxsU2hvd1ByaXZhY3lNZXNzYWdlO1xuY29uc3Qgd2lsbFNob3dQcml2YWN5TWVzc2FnZSQyID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICByZXNvbHZlV2lsbFNob3dQcml2YWN5TWVzc2FnZSA9IHJlc29sdmU7XG59KTtcbmNvbnN0IGdldFByb3BlcnR5ID0gKGZyYW1ld29yaykgPT4ge1xuICAgIGlmIChmcmFtZXdvcmsgPT0gJ2F1cycpXG4gICAgICAgIHJldHVybiAnaHR0cHM6Ly9hdS50aGVndWFyZGlhbi5jb20nO1xuICAgIHJldHVybiBpc0d1YXJkaWFuRG9tYWluKCkgPyBudWxsIDogJ2h0dHBzOi8vdGVzdC50aGVndWFyZGlhbi5jb20nO1xufTtcbmNvbnN0IGluaXQkMiA9IChmcmFtZXdvcmssIHB1YkRhdGEgPSB7fSkgPT4ge1xuICAgIHN0dWIoZnJhbWV3b3JrKTtcbiAgICBpZiAod2luZG93Ll9zcF8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3VyY2Vwb2ludCBnbG9iYWwgKHdpbmRvdy5fc3BfKSBpcyBhbHJlYWR5IGRlZmluZWQhJyk7XG4gICAgfVxuICAgIHNldEN1cnJlbnRGcmFtZXdvcmsoZnJhbWV3b3JrKTtcbiAgICBpbnZva2VDYWxsYmFja3MoKTtcbiAgICBjb25zdCBmcmFtZXdvcmtNZXNzYWdlVHlwZSA9IGZyYW1ld29yayA9PSAndGNmdjInID8gJ2dkcHInIDogJ2NjcGEnO1xuICAgIGxvZygnY21wJywgYGZyYW1ld29yazogJHtmcmFtZXdvcmt9YCk7XG4gICAgbG9nKCdjbXAnLCBgZnJhbWV3b3JrTWVzc2FnZVR5cGU6ICR7ZnJhbWV3b3JrTWVzc2FnZVR5cGV9YCk7XG4gICAgd2luZG93Ll9zcF9xdWV1ZSA9IFtdO1xuICAgIHdpbmRvdy5fc3BfID0ge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIGJhc2VFbmRwb2ludDogRU5EUE9JTlQsXG4gICAgICAgICAgICBhY2NvdW50SWQ6IEFDQ09VTlRfSUQsXG4gICAgICAgICAgICBwcm9wZXJ0eUhyZWY6IGdldFByb3BlcnR5KGZyYW1ld29yayksXG4gICAgICAgICAgICB0YXJnZXRpbmdQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmssXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHViRGF0YTogeyAuLi5wdWJEYXRhLCBjbXBJbml0VGltZVV0YzogbmV3IERhdGUoKS5nZXRUaW1lKCkgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIG9uQ29uc2VudFJlYWR5OiAobWVzc2FnZV90eXBlLCBjb25zZW50VVVJRCwgZXVjb25zZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uQ29uc2VudFJlYWR5ICR7bWVzc2FnZV90eXBlfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZV90eXBlICE9IGZyYW1ld29ya01lc3NhZ2VUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBjb25zZW50VVVJRCAke2NvbnNlbnRVVUlEfWApO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBldWNvbnNlbnQgJHtldWNvbnNlbnR9YCk7XG4gICAgICAgICAgICAgICAgICAgIG1hcmsoJ2NtcC1nb3QtY29uc2VudCcpO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGludm9rZUNhbGxiYWNrcywgMCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbk1lc3NhZ2VSZWFkeTogKG1lc3NhZ2VfdHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VSZWFkeSAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbWFyaygnY21wLXVpLWRpc3BsYXllZCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25NZXNzYWdlUmVjZWl2ZURhdGE6IChtZXNzYWdlX3R5cGUsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25NZXNzYWdlUmVjZWl2ZURhdGEgJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgJ29uTWVzc2FnZVJlY2VpdmVEYXRhICcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB2b2lkIHJlc29sdmVXaWxsU2hvd1ByaXZhY3lNZXNzYWdlKGRhdGEubWVzc2FnZUlkICE9PSAwKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uTWVzc2FnZUNob2ljZVNlbGVjdDogKG1lc3NhZ2VfdHlwZSwgY2hvaWNlX2lkLCBjaG9pY2VUeXBlSUQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25NZXNzYWdlQ2hvaWNlU2VsZWN0IG1lc3NhZ2VfdHlwZTogJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uTWVzc2FnZUNob2ljZVNlbGVjdCBjaG9pY2VfaWQ6ICR7Y2hvaWNlX2lkfWApO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VDaG9pY2VTZWxlY3QgY2hvaWNlX3R5cGVfaWQ6ICR7Y2hvaWNlVHlwZUlEfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvaWNlVHlwZUlEID09PSAxMSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlVHlwZUlEID09PSAxMyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlVHlwZUlEID09PSAxNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChpbnZva2VDYWxsYmFja3MsIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblByaXZhY3lNYW5hZ2VyQWN0aW9uOiBmdW5jdGlvbiAobWVzc2FnZV90eXBlLCBwbURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25Qcml2YWN5TWFuYWdlckFjdGlvbiBtZXNzYWdlX3R5cGU6ICR7bWVzc2FnZV90eXBlfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZV90eXBlICE9IGZyYW1ld29ya01lc3NhZ2VUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvblByaXZhY3lNYW5hZ2VyQWN0aW9uICR7cG1EYXRhfWApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25NZXNzYWdlQ2hvaWNlRXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlX3R5cGUsIGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGBvbk1lc3NhZ2VDaG9pY2VFcnJvciAke21lc3NhZ2VfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSAhPSBmcmFtZXdvcmtNZXNzYWdlVHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbG9nKCdjbXAnLCBgb25NZXNzYWdlQ2hvaWNlRXJyb3IgJHtlcnJ9YCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblBNQ2FuY2VsOiBmdW5jdGlvbiAobWVzc2FnZV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYG9uUE1DYW5jZWwgJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblNQUE1PYmplY3RSZWFkeTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsICdvblNQUE1PYmplY3RSZWFkeScpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2VfdHlwZSwgZXJyb3JDb2RlLCBlcnJvck9iamVjdCwgdXNlclJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYGVycm9yQ29kZTogJHttZXNzYWdlX3R5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlX3R5cGUgIT0gZnJhbWV3b3JrTWVzc2FnZVR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgYGVycm9yQ29kZTogJHtlcnJvckNvZGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZygnY21wJywgZXJyb3JPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICBsb2coJ2NtcCcsIGB1c2VyUmVzZXQ6ICR7dXNlclJlc2V0fWApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG4gICAgaWYgKGZyYW1ld29yayA9PT0gJ3RjZnYyJykge1xuICAgICAgICB3aW5kb3cuX3NwXy5jb25maWcuZ2RwciA9IHtcbiAgICAgICAgICAgIHRhcmdldGluZ1BhcmFtczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29yayxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB3aW5kb3cuX3NwXy5jb25maWcuY2NwYSA9IHtcbiAgICAgICAgICAgIHRhcmdldGluZ1BhcmFtczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29yayxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHNwTGliID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc3BMaWIuaWQgPSAnc291cmNlcG9pbnQtbGliJztcbiAgICBzcExpYi5zcmMgPSBgJHtFTkRQT0lOVH0vdW5pZmllZC93cmFwcGVyTWVzc2FnaW5nV2l0aG91dERldGVjdGlvbi5qc2A7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcExpYik7XG59O1xuXG5jb25zdCBpbml0JDEgPSAoZnJhbWV3b3JrLCBwdWJEYXRhKSA9PiB7XG4gICAgbWFyaygnY21wLWluaXQnKTtcbiAgICBpbml0JDIoZnJhbWV3b3JrLCBwdWJEYXRhKTtcbn07XG5jb25zdCB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlJDEgPSAoKSA9PiB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlJDI7XG5mdW5jdGlvbiBzaG93UHJpdmFjeU1hbmFnZXIkMSgpIHtcbiAgICBzd2l0Y2ggKGdldEN1cnJlbnRGcmFtZXdvcmsoKSkge1xuICAgICAgICBjYXNlICd0Y2Z2Mic6XG4gICAgICAgICAgICB3aW5kb3cuX3NwXz8uZ2Rwcj8ubG9hZFByaXZhY3lNYW5hZ2VyTW9kYWw/LihQUklWQUNZX01BTkFHRVJfVENGVjIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NjcGEnOlxuICAgICAgICAgICAgd2luZG93Ll9zcF8/LmNjcGE/LmxvYWRQcml2YWN5TWFuYWdlck1vZGFsPy4oUFJJVkFDWV9NQU5BR0VSX0NDUEEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2F1cyc6XG4gICAgICAgICAgICB3aW5kb3cuX3NwXz8uY2NwYT8ubG9hZFByaXZhY3lNYW5hZ2VyTW9kYWw/LihQUklWQUNZX01BTkFHRVJfQVVTVFJBTElBKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbmNvbnN0IENNUCA9IHtcbiAgICBpbml0OiBpbml0JDEsXG4gICAgd2lsbFNob3dQcml2YWN5TWVzc2FnZTogd2lsbFNob3dQcml2YWN5TWVzc2FnZSQxLFxuICAgIHNob3dQcml2YWN5TWFuYWdlcjogc2hvd1ByaXZhY3lNYW5hZ2VyJDEsXG59O1xuXG5jb25zdCBDT09LSUVfTkFNRSA9ICdndS1jbXAtZGlzYWJsZWQnO1xuY29uc3QgZGlzYWJsZSA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5jb29raWUgPSBgJHtDT09LSUVfTkFNRX09dHJ1ZWA7XG59O1xuY29uc3QgZW5hYmxlID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmNvb2tpZSA9IGAke0NPT0tJRV9OQU1FfT1mYWxzZWA7XG59O1xuY29uc3QgaXNEaXNhYmxlZCA9ICgpID0+IG5ldyBSZWdFeHAoYCR7Q09PS0lFX05BTUV9PXRydWUoXFxcXFcrfCQpYCkudGVzdChkb2N1bWVudC5jb29raWUpO1xuXG5jb25zdCBWZW5kb3JJRHMgPSB7XG4gICAgYTk6IFsnNWYzNjlhMDJiOGUwNWMzMDg3MDFmODI5J10sXG4gICAgYWNhc3Q6IFsnNWYyMDNkY2IxZjBkZWE3OTA1NjJlMjBmJ10sXG4gICAgYnJhemU6IFsnNWVkOGM0OWM0YjhjZTQ1NzFjN2FkODAxJ10sXG4gICAgY29tc2NvcmU6IFsnNWVmZWZlMjViOGUwNWMwNjU0MmIyYTc3J10sXG4gICAgZmI6IFsnNWU3ZTEyOThiOGUwNWM1NGE4NWM1MmQyJ10sXG4gICAgJ2dvb2dsZS1hbmFseXRpY3MnOiBbJzVlNTQyYjNhNGNkODg4NGViNDFiNWE3MiddLFxuICAgICdnb29nbGUtbW9iaWxlLWFkcyc6IFsnNWYxYWFkYTZiOGUwNWMzMDZjMDU5N2Q3J10sXG4gICAgJ2dvb2dsZS10YWctbWFuYWdlcic6IFsnNWU5NTJmNjEwN2Q5ZDIwYzg4ZTdjOTc1J10sXG4gICAgZ29vZ2xldGFnOiBbJzVmMWFhZGE2YjhlMDVjMzA2YzA1OTdkNyddLFxuICAgIGlhczogWyc1ZTdjZWQ1N2I4ZTA1YzQ4NTI0NmNjZjMnXSxcbiAgICBpbml6aW86IFsnNWUzN2ZjM2U1NmE1ZTY2MTU1MDJmOWM5J10sXG4gICAgaXBzb3M6IFsnNWY3NDVhYjk2ZjNhYWUwMTYzNzQwNDA5J10sXG4gICAgbG90YW1lOiBbJzVlZDZhZWIxYjhlMDVjMjQxYTYzYzcxZiddLFxuICAgIG5pZWxzZW46IFsnNWVmNWMzYTViOGUwNWM2OTk4MGVhYTViJ10sXG4gICAgb3BoYW46IFsnNWYyMDNkYmVlYWFhYTg3NjhmZDMyMjZhJ10sXG4gICAgcGVybXV0aXZlOiBbJzVlZmYwZDc3OTY5YmZhMDM3NDY0MjdlYiddLFxuICAgIHByZWJpZDogWyc1ZjkyYTYyYWEyMjg2MzY4NWY0ZGFhNGMnXSxcbiAgICByZWRwbGFuZXQ6IFsnNWYxOTljMzAyNDI1YTMzZjNmMDkwZjUxJ10sXG4gICAgcmVtYXJrZXRpbmc6IFsnNWVkMGViNjg4YTc2NTAzZjEwMTY1NzhmJ10sXG4gICAgc2VudHJ5OiBbJzVmMGYzOTAxNGVmZmRhNmU4YmJkMjAwNiddLFxuICAgIHRlYWRzOiBbJzVlYWIzZDVhYjhlMDVjMmJiZTMzZjM5OSddLFxuICAgIHR3aXR0ZXI6IFsnNWU3MTc2MGI2OTk2NjU0MGU0NTU0ZjAxJ10sXG4gICAgJ3lvdXR1YmUtcGxheWVyJzogWyc1ZTdhYzNmYWUzMGU3ZDFiYzFlYmY1ZTgnXSxcbn07XG5cbmNvbnN0IGdldENvbnNlbnRGb3IkMSA9ICh2ZW5kb3IsIGNvbnNlbnQpID0+IHtcbiAgICBjb25zdCBzb3VyY2Vwb2ludElkcyA9IFZlbmRvcklEc1t2ZW5kb3JdO1xuICAgIGlmICh0eXBlb2Ygc291cmNlcG9pbnRJZHMgPT09ICd1bmRlZmluZWQnIHx8IHNvdXJjZXBvaW50SWRzID09PSBbXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFZlbmRvciAnJHt2ZW5kb3J9JyBub3QgZm91bmQsIG9yIHdpdGggbm8gU291cmNlcG9pbnQgSUQuIGAgK1xuICAgICAgICAgICAgJ0lmIGl0IHNob3VsZCBiZSBhZGRlZCwgcmFpc2UgYW4gaXNzdWUgYXQgaHR0cHM6Ly9naXQuaW8vSlV6VkwnKTtcbiAgICB9XG4gICAgaWYgKGNvbnNlbnQuY2NwYSkge1xuICAgICAgICByZXR1cm4gIWNvbnNlbnQuY2NwYS5kb05vdFNlbGw7XG4gICAgfVxuICAgIGlmIChjb25zZW50LmF1cykge1xuICAgICAgICByZXR1cm4gY29uc2VudC5hdXMucGVyc29uYWxpc2VkQWR2ZXJ0aXNpbmc7XG4gICAgfVxuICAgIGNvbnN0IGZvdW5kU291cmNlcG9pbnRJZCA9IHNvdXJjZXBvaW50SWRzLmZpbmQoKGlkKSA9PiB0eXBlb2YgY29uc2VudC50Y2Z2Mj8udmVuZG9yQ29uc2VudHNbaWRdICE9PSAndW5kZWZpbmVkJyk7XG4gICAgaWYgKHR5cGVvZiBmb3VuZFNvdXJjZXBvaW50SWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgTm8gY29uc2VudCByZXR1cm5lZCBmcm9tIFNvdXJjZXBvaW50IGZvciB2ZW5kb3I6ICcke3ZlbmRvcn0nYCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdGNmdjJDb25zZW50ID0gY29uc2VudC50Y2Z2Mj8udmVuZG9yQ29uc2VudHNbZm91bmRTb3VyY2Vwb2ludElkXTtcbiAgICBpZiAodHlwZW9mIHRjZnYyQ29uc2VudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBObyBjb25zZW50IHJldHVybmVkIGZyb20gU291cmNlcG9pbnQgZm9yIHZlbmRvcjogJyR7dmVuZG9yfSdgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGNmdjJDb25zZW50O1xufTtcblxuY29uc3QgZ2V0RnJhbWV3b3JrID0gKGNvdW50cnlDb2RlKSA9PiB7XG4gICAgbGV0IGZyYW1ld29yaztcbiAgICBzd2l0Y2ggKGNvdW50cnlDb2RlKSB7XG4gICAgICAgIGNhc2UgJ1VTJzpcbiAgICAgICAgICAgIGZyYW1ld29yayA9ICdjY3BhJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdBVSc6XG4gICAgICAgICAgICBmcmFtZXdvcmsgPSAnYXVzJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdHQic6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBmcmFtZXdvcmsgPSAndGNmdjInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZXdvcms7XG59O1xuXG52YXIgX2EsIF9iLCBfYztcbmlmICghaXNTZXJ2ZXJTaWRlKSB7XG4gICAgd2luZG93Lmd1Q21wSG90Rml4IHx8ICh3aW5kb3cuZ3VDbXBIb3RGaXggPSB7fSk7XG59XG5sZXQgX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2U7XG5sZXQgaW5pdENvbXBsZXRlID0gZmFsc2U7XG5sZXQgcmVzb2x2ZUluaXRpYWxpc2VkO1xuY29uc3QgaW5pdGlhbGlzZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHJlc29sdmVJbml0aWFsaXNlZCA9IHJlc29sdmU7XG59KTtcbmNvbnN0IGluaXQgPSAoeyBwdWJEYXRhLCBjb3VudHJ5IH0pID0+IHtcbiAgICBpZiAoaXNEaXNhYmxlZCgpIHx8IGlzU2VydmVyU2lkZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmICh3aW5kb3cuZ3VDbXBIb3RGaXguaW5pdGlhbGlzZWQpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5ndUNtcEhvdEZpeC5jbXA/LnZlcnNpb24gIT09IFwiMC4wLjAtdGhpcy1uZXZlci11cGRhdGVzLWluLXNvdXJjZS1jb2RlLXJlZmVyLXRvLWdpdC10YWdzXCIpXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1R3byBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIENNUCBhcmUgcnVubmluZzonLCBbXG4gICAgICAgICAgICAgICAgXCIwLjAuMC10aGlzLW5ldmVyLXVwZGF0ZXMtaW4tc291cmNlLWNvZGUtcmVmZXItdG8tZ2l0LXRhZ3NcIixcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ3VDbXBIb3RGaXguY21wPy52ZXJzaW9uLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2luZG93Lmd1Q21wSG90Rml4LmluaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICBpZiAodHlwZW9mIGNvdW50cnkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ01QIGluaXRpYWxpc2VkIHdpdGhvdXQgYGNvdW50cnlgIHByb3BlcnR5LiBBIDItbGV0dGVyLCBJU08gSVNPXzMxNjYtMSBjb3VudHJ5IGNvZGUgaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGZyYW1ld29yayA9IGdldEZyYW1ld29yayhjb3VudHJ5KTtcbiAgICBDTVAuaW5pdChmcmFtZXdvcmssIHB1YkRhdGEgPz8ge30pO1xuICAgIHZvaWQgQ01QLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UoKS50aGVuKCh3aWxsU2hvd1ZhbHVlKSA9PiB7XG4gICAgICAgIF93aWxsU2hvd1ByaXZhY3lNZXNzYWdlID0gd2lsbFNob3dWYWx1ZTtcbiAgICAgICAgaW5pdENvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgbG9nKCdjbXAnLCAnaW5pdENvbXBsZXRlJyk7XG4gICAgfSk7XG4gICAgcmVzb2x2ZUluaXRpYWxpc2VkKCk7XG59O1xuY29uc3Qgd2lsbFNob3dQcml2YWN5TWVzc2FnZSA9ICgpID0+IGluaXRpYWxpc2VkLnRoZW4oKCkgPT4gQ01QLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UoKSk7XG5jb25zdCB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlU3luYyA9ICgpID0+IHtcbiAgICBpZiAoX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gX3dpbGxTaG93UHJpdmFjeU1lc3NhZ2U7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignQ01QIGhhcyBub3QgYmVlbiBpbml0aWFsaXNlZC4gVXNlIHRoZSBhc3luYyB3aWxsU2hvd1ByaXZhY3lNZXNzYWdlKCkgaW5zdGVhZC4nKTtcbn07XG5jb25zdCBoYXNJbml0aWFsaXNlZCA9ICgpID0+IGluaXRDb21wbGV0ZTtcbmNvbnN0IHNob3dQcml2YWN5TWFuYWdlciA9ICgpID0+IHtcbiAgICB2b2lkIGluaXRpYWxpc2VkLnRoZW4oQ01QLnNob3dQcml2YWN5TWFuYWdlcik7XG59O1xuY29uc3QgY21wID0gaXNTZXJ2ZXJTaWRlXG4gICAgPyBjbXAkMVxuICAgIDogKChfYSA9IHdpbmRvdy5ndUNtcEhvdEZpeCkuY21wIHx8IChfYS5jbXAgPSB7XG4gICAgICAgIGluaXQsXG4gICAgICAgIHdpbGxTaG93UHJpdmFjeU1lc3NhZ2UsXG4gICAgICAgIHdpbGxTaG93UHJpdmFjeU1lc3NhZ2VTeW5jLFxuICAgICAgICBoYXNJbml0aWFsaXNlZCxcbiAgICAgICAgc2hvd1ByaXZhY3lNYW5hZ2VyLFxuICAgICAgICB2ZXJzaW9uOiBcIjAuMC4wLXRoaXMtbmV2ZXItdXBkYXRlcy1pbi1zb3VyY2UtY29kZS1yZWZlci10by1naXQtdGFnc1wiLFxuICAgICAgICBfX2lzRGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgIF9fZW5hYmxlOiBlbmFibGUsXG4gICAgICAgIF9fZGlzYWJsZTogZGlzYWJsZSxcbiAgICB9KSk7XG5jb25zdCBvbkNvbnNlbnRDaGFuZ2UgPSBpc1NlcnZlclNpZGVcbiAgICA/IG9uQ29uc2VudENoYW5nZSQyXG4gICAgOiAoKF9iID0gd2luZG93Lmd1Q21wSG90Rml4KS5vbkNvbnNlbnRDaGFuZ2UgfHwgKF9iLm9uQ29uc2VudENoYW5nZSA9IG9uQ29uc2VudENoYW5nZSQxKSk7XG5jb25zdCBnZXRDb25zZW50Rm9yID0gaXNTZXJ2ZXJTaWRlXG4gICAgPyBnZXRDb25zZW50Rm9yJDJcbiAgICA6ICgoX2MgPSB3aW5kb3cuZ3VDbXBIb3RGaXgpLmdldENvbnNlbnRGb3IgfHwgKF9jLmdldENvbnNlbnRGb3IgPSBnZXRDb25zZW50Rm9yJDEpKTtcblxuZXhwb3J0IHsgY21wLCBnZXRDb25zZW50Rm9yLCBvbkNvbnNlbnRDaGFuZ2UgfTtcbiIsInZhciBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0ID0gKHRoaXMgJiYgdGhpcy5fX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KSB8fCBmdW5jdGlvbiAocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcbn07XG52YXIgX19jbGFzc1ByaXZhdGVGaWVsZEdldCA9ICh0aGlzICYmIHRoaXMuX19jbGFzc1ByaXZhdGVGaWVsZEdldCkgfHwgZnVuY3Rpb24gKHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xufTtcbnZhciBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgX2xvY2FsLCBfc2Vzc2lvbiwgX2E7XG5jbGFzcyBTdG9yYWdlRmFjdG9yeSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcmFnZSkge1xuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9DbGFzc2VzL1ByaXZhdGVfY2xhc3NfZmllbGRzXG4gICAgICAgIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLnNldCh0aGlzLCB2b2lkIDApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdWlkID0gbmV3IERhdGUoKS50b1N0cmluZygpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXRJdGVtKHVpZCwgdWlkKTtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZSA9IHN0b3JhZ2UuZ2V0SXRlbSh1aWQpID09IHVpZDtcbiAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSh1aWQpO1xuICAgICAgICAgICAgaWYgKGF2YWlsYWJsZSlcbiAgICAgICAgICAgICAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBzdG9yYWdlLCBcImZcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayB3aGV0aGVyIHN0b3JhZ2UgaXMgYXZhaWxhYmxlLlxuICAgICAqL1xuICAgIGlzQXZhaWxhYmxlKCkge1xuICAgICAgICByZXR1cm4gQm9vbGVhbihfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIikpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZGlzYWJsZVxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnQsXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuLFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIC0tXG4gICAgICAgIC0gd2UncmUgdXNpbmcgdGhlIGB0cnlgIHRvIGhhbmRsZSBhbnl0aGluZyBiYWQgaGFwcGVuaW5nXG4gICAgICAgIC0gSlNPTi5wYXJzZSByZXR1cm5zIGFuIGBhbnlgLCB3ZSByZWFsbHkgYXJlIHJldHVybmluZyBhbiBgYW55YFxuICAgICovXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYW4gaXRlbSBmcm9tIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKi9cbiAgICBnZXQoa2V5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHZhbHVlLCBleHBpcmVzIH0gPSBKU09OLnBhcnNlKF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uZ2V0SXRlbShrZXkpID8/ICcnKTtcbiAgICAgICAgICAgIC8vIGlzIHRoaXMgaXRlbSBoYXMgcGFzc2VkIGl0cyBzZWxsLWJ5LWRhdGUsIHJlbW92ZSBpdFxuICAgICAgICAgICAgaWYgKGV4cGlyZXMgJiYgbmV3IERhdGUoKSA+IG5ldyBEYXRlKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoa2V5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZVxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFzc2lnbm1lbnQsXG4gICAgICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuLFxuICAgICAgICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgKi9cbiAgICAvKipcbiAgICAgKiBTYXZlIGEgdmFsdWUgdG8gc3RvcmFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXkgLSB0aGUgbmFtZSBvZiB0aGUgaXRlbVxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSBkYXRhIHRvIHNhdmVcbiAgICAgKiBAcGFyYW0gZXhwaXJlcyAtIG9wdGlvbmFsIGRhdGUgb24gd2hpY2ggdGhpcyBkYXRhIHdpbGwgZXhwaXJlXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUsIGV4cGlyZXMpIHtcbiAgICAgICAgcmV0dXJuIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UsIFwiZlwiKT8uc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgZXhwaXJlcyxcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gaXRlbSBmcm9tIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IC0gdGhlIG5hbWUgb2YgdGhlIGl0ZW1cbiAgICAgKi9cbiAgICByZW1vdmUoa2V5KSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LnJlbW92ZUl0ZW0oa2V5KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgaXRlbXMgZnJvbSBzdG9yYWdlLlxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5jbGVhcigpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhbiBpdGVtIGZyb20gc3RvcmFnZSBpbiBpdHMgcmF3IHN0YXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICovXG4gICAgZ2V0UmF3KGtleSkge1xuICAgICAgICByZXR1cm4gX19jbGFzc1ByaXZhdGVGaWVsZEdldCh0aGlzLCBfU3RvcmFnZUZhY3Rvcnlfc3RvcmFnZSwgXCJmXCIpPy5nZXRJdGVtKGtleSkgPz8gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2F2ZSBhIHJhdyB2YWx1ZSB0byBzdG9yYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGtleSAtIHRoZSBuYW1lIG9mIHRoZSBpdGVtXG4gICAgICogQHBhcmFtIHZhbHVlIC0gdGhlIGRhdGEgdG8gc2F2ZVxuICAgICAqL1xuICAgIHNldFJhdyhrZXksIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHRoaXMsIF9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlLCBcImZcIik/LnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxufVxuX1N0b3JhZ2VGYWN0b3J5X3N0b3JhZ2UgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBNYW5hZ2VzIHVzaW5nIGBsb2NhbFN0b3JhZ2VgIGFuZCBgc2Vzc2lvblN0b3JhZ2VgLlxuICpcbiAqIEhhcyBhIGZldyBhZHZhbnRhZ2VzIG92ZXIgdGhlIG5hdGl2ZSBBUEksIGluY2x1ZGluZ1xuICogLSBmYWlsaW5nIGdyYWNlZnVsbHkgaWYgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlXG4gKiAtIHlvdSBjYW4gc2F2ZSBhbmQgcmV0cmlldmUgYW55IEpTT05hYmxlIGRhdGFcbiAqXG4gKiBBbGwgbWV0aG9kcyBhcmUgYXZhaWxhYmxlIGZvciBib3RoIGBsb2NhbFN0b3JhZ2VgIGFuZCBgc2Vzc2lvblN0b3JhZ2VgLlxuICovXG5leHBvcnQgY29uc3Qgc3RvcmFnZSA9IG5ldyAoX2EgPSBjbGFzcyB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgX2xvY2FsLnNldCh0aGlzLCB2b2lkIDApO1xuICAgICAgICAgICAgX3Nlc3Npb24uc2V0KHRoaXMsIHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY3JlYXRpbmcgdGhlIGluc3RhbmNlIHJlcXVpcmVzIHRlc3RpbmcgdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvblxuICAgICAgICAvLyB3aGljaCBpcyBibG9ja2luZy4gdGhlcmVmb3JlLCBvbmx5IGNyZWF0ZSBuZXcgaW5zdGFuY2VzIG9mIHRoZSBmYWN0b3J5XG4gICAgICAgIC8vIHdoZW4gaXQncyBhY2Nlc3NlZCBpLmUuIHdlIGtub3cgd2UncmUgZ29pbmcgdG8gdXNlIGl0XG4gICAgICAgIGdldCBsb2NhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiAoX19jbGFzc1ByaXZhdGVGaWVsZFNldCh0aGlzLCBfbG9jYWwsIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX2xvY2FsLCBcImZcIikgfHwgbmV3IFN0b3JhZ2VGYWN0b3J5KGxvY2FsU3RvcmFnZSksIFwiZlwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IHNlc3Npb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9fY2xhc3NQcml2YXRlRmllbGRTZXQodGhpcywgX3Nlc3Npb24sIF9fY2xhc3NQcml2YXRlRmllbGRHZXQodGhpcywgX3Nlc3Npb24sIFwiZlwiKSB8fCBuZXcgU3RvcmFnZUZhY3Rvcnkoc2Vzc2lvblN0b3JhZ2UpLCBcImZcIikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfbG9jYWwgPSBuZXcgV2Vha01hcCgpLFxuICAgIF9zZXNzaW9uID0gbmV3IFdlYWtNYXAoKSxcbiAgICBfYSkoKTtcbiIsIi8qKlxuICogWW91IGNhbiBvbmx5IHN1YnNjcmliZSB0byB0ZWFtcyBmcm9tIHRoaXMgbGlzdC5cbiAqIEFkZCB5b3VyIHRlYW0gbmFtZSBiZWxvdyB0byBzdGFydCBsb2dnaW5nLlxuICpcbiAqIE1ha2Ugc3VyZSB5b3VyIGxhYmVsIGhhcyBhIGNvbnRyYXN0IHJhdGlvIG9mIDQuNSBvciBtb3JlLlxuICogKi9cbmV4cG9ydCBjb25zdCB0ZWFtcyA9IHtcbiAgICBjb21tb246IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMwNTI5NjInLFxuICAgICAgICBmb250OiAnI2ZmZmZmZicsXG4gICAgfSxcbiAgICBjb21tZXJjaWFsOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjNzdFRUFBJyxcbiAgICAgICAgZm9udDogJyMwMDQ0MDAnLFxuICAgIH0sXG4gICAgY21wOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjRkY2QkI1JyxcbiAgICAgICAgZm9udDogJyMyRjA0MDQnLFxuICAgIH0sXG4gICAgZG90Y29tOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjMDAwMDAwJyxcbiAgICAgICAgZm9udDogJyNmZjczMDAnLFxuICAgIH0sXG4gICAgZGVzaWduOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjMTg1RTM2JyxcbiAgICAgICAgZm9udDogJyNGRkY0RjInLFxuICAgIH0sXG4gICAgdHg6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyMyRjRGNEYnLFxuICAgICAgICBmb250OiAnI0ZGRkZGRicsXG4gICAgfSxcbn07XG4iLCIvKipcbiAqXG4gKiBIYW5kbGVzIHRlYW0tYmFzZWQgbG9nZ2luZyB0byB0aGUgYnJvd3NlciBjb25zb2xlXG4gKlxuICogUHJldmVudHMgYSBwcm9saWZlcmF0aW9uIG9mIGNvbnNvbGUubG9nIGluIGNsaWVudC1zaWRlXG4gKiBjb2RlLlxuICpcbiAqIFN1YnNjcmliaW5nIHRvIGxvZ3MgcmVsaWVzIG9uIExvY2FsU3RvcmFnZVxuICovXG52YXIgX2E7XG5pbXBvcnQgeyB0ZWFtcyB9IGZyb20gJy4vbG9nZ2VyLnRlYW1zJztcbmltcG9ydCB7IHN0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuY29uc3QgS0VZID0gJ2d1LmxvZ2dlcic7XG5jb25zdCB0ZWFtQ29sb3VycyA9IHRlYW1zO1xuY29uc3Qgc3R5bGUgPSAodGVhbSkgPT4ge1xuICAgIGNvbnN0IHsgYmFja2dyb3VuZCwgZm9udCB9ID0gdGVhbUNvbG91cnNbdGVhbV07XG4gICAgcmV0dXJuIGBiYWNrZ3JvdW5kOiAke2JhY2tncm91bmR9OyBjb2xvcjogJHtmb250fTsgcGFkZGluZzogMnB4IDNweDsgYm9yZGVyLXJhZGl1czozcHhgO1xufTtcbi8qKlxuICogT25seSBsb2dzIGluIGRldiBlbnZpcm9ubWVudHMuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWJ1ZyA9ICh0ZWFtLCAuLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgaXNEZXZFbnYgPSB3aW5kb3cubG9jYXRpb24uaG9zdC5pbmNsdWRlcygnbG9jYWxob3N0JykgfHxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhvc3QuZW5kc1dpdGgoJ3RoZWd1bG9jYWwuY29tJykgfHxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhvc3QuZW5kc1dpdGgoJy5kZXYtdGhlZ3VhcmRpYW4uY29tJyk7XG4gICAgaWYgKGlzRGV2RW52KVxuICAgICAgICBsb2codGVhbSwgLi4uYXJncyk7XG59O1xuLyoqXG4gKiBSdW5zIGluIGFsbCBlbnZpcm9ubWVudHMsIGlmIGxvY2FsIHN0b3JhZ2UgdmFsdWVzIGFyZSBzZXQuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2cgPSAodGVhbSwgLi4uYXJncykgPT4ge1xuICAgIC8vIFRPRE8gYWRkIGNoZWNrIGZvciBsb2NhbFN0b3JhZ2VcbiAgICBpZiAoIShzdG9yYWdlLmxvY2FsLmdldChLRVkpIHx8ICcnKS5pbmNsdWRlcyh0ZWFtKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHN0eWxlcyA9IFtzdHlsZSgnY29tbW9uJyksICcnLCBzdHlsZSh0ZWFtKSwgJyddO1xuICAgIGNvbnNvbGUubG9nKGAlY0BndWFyZGlhbiVjICVjJHt0ZWFtfSVjYCwgLi4uc3R5bGVzLCAuLi5hcmdzKTtcbn07XG4vKipcbiAqIFN1YnNjcmliZSB0byBhIHRlYW3igJlzIGxvZ1xuICogQHBhcmFtIHRlYW0gdGhlIHRlYW3igJlzIHVuaXF1ZSBJRFxuICovXG5jb25zdCBzdWJzY3JpYmVUbyA9ICh0ZWFtKSA9PiB7XG4gICAgY29uc3QgdGVhbVN1YnNjcmlwdGlvbnMgPSBzdG9yYWdlLmxvY2FsLmdldChLRVkpXG4gICAgICAgID8gc3RvcmFnZS5sb2NhbC5nZXQoS0VZKS5zcGxpdCgnLCcpXG4gICAgICAgIDogW107XG4gICAgaWYgKCF0ZWFtU3Vic2NyaXB0aW9ucy5pbmNsdWRlcyh0ZWFtKSlcbiAgICAgICAgdGVhbVN1YnNjcmlwdGlvbnMucHVzaCh0ZWFtKTtcbiAgICBzdG9yYWdlLmxvY2FsLnNldChLRVksIHRlYW1TdWJzY3JpcHRpb25zLmpvaW4oJywnKSk7XG4gICAgbG9nKHRlYW0sICfwn5SUIFN1YnNjcmliZWQsIGhlbGxvIScpO1xufTtcbi8qKlxuICogVW5zdWJzY3JpYmUgdG8gYSB0ZWFt4oCZcyBsb2dcbiAqIEBwYXJhbSB0ZWFtIHRoZSB0ZWFt4oCZcyB1bmlxdWUgSURcbiAqL1xuY29uc3QgdW5zdWJzY3JpYmVGcm9tID0gKHRlYW0pID0+IHtcbiAgICBsb2codGVhbSwgJ/CflJUgVW5zdWJzY3JpYmVkLCBnb29kLWJ5ZSEnKTtcbiAgICBjb25zdCB0ZWFtU3Vic2NyaXB0aW9ucyA9IHN0b3JhZ2UubG9jYWwuZ2V0KEtFWSlcbiAgICAgICAgLnNwbGl0KCcsJylcbiAgICAgICAgLmZpbHRlcigodCkgPT4gdCAhPT0gdGVhbSk7XG4gICAgc3RvcmFnZS5sb2NhbC5zZXQoS0VZLCB0ZWFtU3Vic2NyaXB0aW9ucy5qb2luKCcsJykpO1xufTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuZ3VhcmRpYW4gfHwgKHdpbmRvdy5ndWFyZGlhbiA9IHt9KTtcbiAgICAoX2EgPSB3aW5kb3cuZ3VhcmRpYW4pLmxvZ2dlciB8fCAoX2EubG9nZ2VyID0ge1xuICAgICAgICBzdWJzY3JpYmVUbyxcbiAgICAgICAgdW5zdWJzY3JpYmVGcm9tLFxuICAgICAgICB0ZWFtczogKCkgPT4gT2JqZWN0LmtleXModGVhbUNvbG91cnMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IF8gPSB7XG4gICAgdGVhbUNvbG91cnMsXG4gICAgS0VZLFxufTtcbiIsIjxzY3JpcHQ+XG5cdC8vIGFsd2F5cyB1c2UgdGhlIGRpc3QgdmVyc2lvblxuXHRpbXBvcnQgeyBjbXAsIG9uQ29uc2VudENoYW5nZSB9IGZyb20gJy4uLyc7XG5cdGltcG9ydCB7IGxvZyB9IGZyb20gJ0BndWFyZGlhbi9saWJzJztcblx0aW1wb3J0IHsgb25Nb3VudCB9IGZyb20gJ3N2ZWx0ZSc7XG5cblx0c3dpdGNoICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuXHRcdGNhc2UgJyN0Y2Z2Mic6XG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZnJhbWV3b3JrJywgSlNPTi5zdHJpbmdpZnkoJ3RjZnYyJykpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnI2NjcGEnOlxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZyYW1ld29yaycsIEpTT04uc3RyaW5naWZ5KCdjY3BhJykpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnI2F1cyc6XG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZnJhbWV3b3JrJywgSlNPTi5zdHJpbmdpZnkoJ2F1cycpKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9ICd0Y2Z2Mic7XG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZnJhbWV3b3JrJywgSlNPTi5zdHJpbmdpZnkoJ3RjZnYyJykpO1xuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHR3aW5kb3cuZ3VhcmRpYW4ubG9nZ2VyLnN1YnNjcmliZVRvKFwiY21wXCIpXG5cblx0Ly8gYWxsb3cgdXMgdG8gbGlzdGVuIHRvIGNoYW5nZXMgb24gd2luZG93Lmd1Q21wSG90Rml4XG5cdHdpbmRvdy5ndUNtcEhvdEZpeCA9IG5ldyBQcm94eSh3aW5kb3cuZ3VDbXBIb3RGaXgsIHtcblx0XHRzZXQ6IGZ1bmN0aW9uICh0YXJnZXQsIGtleSwgdmFsdWUpIHtcblx0XHRcdHRhcmdldFtrZXldID0gdmFsdWU7XG5cdFx0XHRjb25zb2xlLmluZm8oJyVjd2luZG93Lmd1Q21wSG90Rml4JywgJ2NvbG9yOiBkZWVwcGluazsnLCB7XG5cdFx0XHRcdC4uLndpbmRvdy5ndUNtcEhvdEZpeCxcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblx0fSk7XG5cblx0ZnVuY3Rpb24gbG9nRXZlbnQoZXZlbnQpIHtcblx0XHRldmVudHNMaXN0ID0gWy4uLmV2ZW50c0xpc3QsIGV2ZW50XTtcblx0XHRsb2coJ2NtcCcsIGV2ZW50KTtcblx0fVxuXG5cdGxldCBjbGVhclByZWZlcmVuY2VzID0gKCkgPT4ge1xuXHRcdC8vIGNsZWFyIGxvY2FsIHN0b3JhZ2Vcblx0XHQvLyBodHRwczovL2RvY3VtZW50YXRpb24uc291cmNlcG9pbnQuY29tL3dlYi1pbXBsZW1lbnRhdGlvbi9nZW5lcmFsL2Nvb2tpZXMtYW5kLWxvY2FsLXN0b3JhZ2UjY21wLWxvY2FsLXN0b3JhZ2Vcblx0XHRsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcblxuXHRcdC8vIGNsZWFyIGNvb2tpZXNcblx0XHQvLyBodHRwczovL2RvY3VtZW50YXRpb24uc291cmNlcG9pbnQuY29tL3dlYi1pbXBsZW1lbnRhdGlvbi9nZW5lcmFsL2Nvb2tpZXMtYW5kLWxvY2FsLXN0b3JhZ2UjY21wLWNvb2tpZXNcblx0XHRkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKS5mb3JFYWNoKChjb29raWUpID0+IHtcblx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZVxuXHRcdFx0XHQucmVwbGFjZSgvXiArLywgJycpXG5cdFx0XHRcdC5yZXBsYWNlKC89LiovLCBgPTtleHBpcmVzPSR7bmV3IERhdGUoKS50b1VUQ1N0cmluZygpfTtwYXRoPS9gKTtcblx0XHR9KTtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdH07XG5cblx0bGV0IGZyYW1ld29yayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZyYW1ld29yaycpKTtcblxuXHRsZXQgc2V0TG9jYXRpb24gPSAoKSA9PiB7XG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZyYW1ld29yaycsIEpTT04uc3RyaW5naWZ5KGZyYW1ld29yaykpO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZnJhbWV3b3JrO1xuXHRcdGNsZWFyUHJlZmVyZW5jZXMoKTtcblx0fTtcblxuXHQkOiBjb25zZW50U3RhdGUgPSB7fTtcblx0JDogZXZlbnRzTGlzdCA9IFtdO1xuXG5cdGNtcC53aWxsU2hvd1ByaXZhY3lNZXNzYWdlKCkudGhlbigod2lsbFNob3cpID0+IHtcblx0XHRsb2dFdmVudCh7IHRpdGxlOiAnY21wLndpbGxTaG93UHJpdmFjeU1lc3NhZ2UnLCBwYXlsb2FkOiB3aWxsU2hvdyB9KTtcblx0fSk7XG5cblx0b25Db25zZW50Q2hhbmdlKChwYXlsb2FkKSA9PiB7XG5cdFx0bG9nRXZlbnQoeyB0aXRsZTogJ29uQ29uc2VudENoYW5nZScsIHBheWxvYWQgfSk7XG5cdFx0Y29uc2VudFN0YXRlID0gcGF5bG9hZDtcblx0fSk7XG5cblx0b25Nb3VudChhc3luYyAoKSA9PiB7XG5cdFx0Ly8gU2V0IHRoZSBjb3VudHJ5IGJhc2VkIG9uIGNob3NlbiBmcmFtZXdvcmsuXG5cdFx0Ly8gVGhpcyBpcyBub3QgdG8gYmUgdXNlZCBpbiBwcm9kdWN0aW9uXG5cdFx0bGV0IGNvdW50cnkgPSAnJztcblx0XHRzd2l0Y2ggKGZyYW1ld29yaykge1xuXHRcdFx0Y2FzZSAndGNmdjInOlxuXHRcdFx0XHRjb3VudHJ5ID0gJ0dCJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2NjcGEnOlxuXHRcdFx0XHRjb3VudHJ5ID0gJ1VTJztcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ2F1cyc6XG5cdFx0XHRcdGNvdW50cnkgPSAnQVUnO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHQvLyBkbyB0aGlzIGxvYWRzIHRvIG1ha2Ugc3VyZSB0aGF0IGRvZXNuJ3QgYnJlYWsgdGhpbmdzXG5cdFx0Y21wLmluaXQoeyBjb3VudHJ5IH0pO1xuXHRcdGNtcC5pbml0KHsgY291bnRyeSB9KTtcblx0XHRjbXAuaW5pdCh7IGNvdW50cnkgfSk7XG5cdFx0Y21wLmluaXQoeyBjb3VudHJ5IH0pO1xuXHR9KTtcblxuPC9zY3JpcHQ+XG5cbjxtYWluPlxuXHQ8bmF2PlxuXHRcdDxidXR0b24gb246Y2xpY2s9e2NtcC5zaG93UHJpdmFjeU1hbmFnZXJ9IGRhdGEtY3k9XCJwbVwiXG5cdFx0XHQ+b3BlbiBwcml2YWN5IG1hbmFnZXI8L2J1dHRvblxuXHRcdD5cblx0XHQ8YnV0dG9uIG9uOmNsaWNrPXtjbGVhclByZWZlcmVuY2VzfT5jbGVhciBwcmVmZXJlbmNlczwvYnV0dG9uPlxuXHRcdDxsYWJlbCBjbGFzcz17ZnJhbWV3b3JrID09ICd0Y2Z2MicgPyAnc2VsZWN0ZWQnIDogJ25vbmUnfT5cblx0XHRcdDxpbnB1dFxuXHRcdFx0XHR0eXBlPVwicmFkaW9cIlxuXHRcdFx0XHR2YWx1ZT1cInRjZnYyXCJcblx0XHRcdFx0YmluZDpncm91cD17ZnJhbWV3b3JrfVxuXHRcdFx0XHRvbjpjaGFuZ2U9e3NldExvY2F0aW9ufVxuXHRcdFx0Lz5cblx0XHRcdGluIFJvVzo8c3Ryb25nPlRDRnYyPC9zdHJvbmc+XG5cdFx0PC9sYWJlbD5cblx0XHQ8bGFiZWwgY2xhc3M9e2ZyYW1ld29yayA9PSAnY2NwYScgPyAnc2VsZWN0ZWQnIDogJ25vbmUnfT5cblx0XHRcdDxpbnB1dFxuXHRcdFx0XHR0eXBlPVwicmFkaW9cIlxuXHRcdFx0XHR2YWx1ZT1cImNjcGFcIlxuXHRcdFx0XHRiaW5kOmdyb3VwPXtmcmFtZXdvcmt9XG5cdFx0XHRcdG9uOmNoYW5nZT17c2V0TG9jYXRpb259XG5cdFx0XHQvPlxuXHRcdFx0aW4gVVNBOlxuXHRcdFx0PHN0cm9uZz5DQ1BBPC9zdHJvbmc+XG5cdFx0PC9sYWJlbD5cblx0XHQ8bGFiZWwgY2xhc3M9e2ZyYW1ld29yayA9PSAnYXVzJyA/ICdzZWxlY3RlZCcgOiAnbm9uZSd9PlxuXHRcdFx0PGlucHV0XG5cdFx0XHRcdHR5cGU9XCJyYWRpb1wiXG5cdFx0XHRcdHZhbHVlPVwiYXVzXCJcblx0XHRcdFx0YmluZDpncm91cD17ZnJhbWV3b3JrfVxuXHRcdFx0XHRvbjpjaGFuZ2U9e3NldExvY2F0aW9ufVxuXHRcdFx0Lz5cblx0XHRcdGluIEF1c3RyYWxpYTpcblx0XHRcdDxzdHJvbmc+Q0NQQS1saWtlPC9zdHJvbmc+XG5cdFx0PC9sYWJlbD5cblx0PC9uYXY+XG5cblx0PGRpdiBpZD1cImNvbnNlbnQtc3RhdGVcIj5cblx0XHR7I2lmIGNvbnNlbnRTdGF0ZS50Y2Z2Mn1cblx0XHRcdDxoMj50Y2Z2Mi5ldmVudFN0YXR1czwvaDI+XG5cdFx0XHQ8c3BhbiBjbGFzcz1cImxhYmVsXCI+e2NvbnNlbnRTdGF0ZS50Y2Z2Mi5ldmVudFN0YXR1c308L3NwYW4+XG5cblx0XHRcdDxoMj50Y2Z2Mi5jb25zZW50czwvaDI+XG5cdFx0XHR7I2VhY2ggT2JqZWN0LmVudHJpZXMoY29uc2VudFN0YXRlLnRjZnYyLmNvbnNlbnRzKSBhcyBbcHVycG9zZSwgc3RhdGVdfVxuXHRcdFx0XHQ8c3BhblxuXHRcdFx0XHRcdGNsYXNzPXtKU09OLnBhcnNlKHN0YXRlKSA/ICd5ZXMnIDogJ25vJ31cblx0XHRcdFx0XHRkYXRhLXB1cnBvc2U9e3B1cnBvc2V9XG5cdFx0XHRcdFx0ZGF0YS1jb25zZW50PXtzdGF0ZX0+e3B1cnBvc2V9PC9zcGFuXG5cdFx0XHRcdD5cblx0XHRcdHsvZWFjaH1cblxuXHRcdFx0PGgyPnRjZnYyLnZlbmRvckNvbnNlbnRzPC9oMj5cblx0XHRcdHsjZWFjaCBPYmplY3QuZW50cmllcyhjb25zZW50U3RhdGUudGNmdjIudmVuZG9yQ29uc2VudHMpIGFzIFtjb25zZW50LCBzdGF0ZV19XG5cdFx0XHRcdDxzcGFuIGNsYXNzPXtKU09OLnBhcnNlKHN0YXRlKSA/ICd5ZXMnIDogJ25vJ30+e2NvbnNlbnR9PC9zcGFuPlxuXHRcdFx0ey9lYWNofVxuXHRcdHs6ZWxzZSBpZiBjb25zZW50U3RhdGUuY2NwYX1cblx0XHRcdDxoMj5jY3BhLmRvTm90U2VsbDwvaDI+XG5cdFx0XHQ8c3BhbiBjbGFzcz1cImxhYmVsXCIgZGF0YS1kb25vdHNlbGw9e2NvbnNlbnRTdGF0ZS5jY3BhLmRvTm90U2VsbH1cblx0XHRcdFx0Pntjb25zZW50U3RhdGUuY2NwYS5kb05vdFNlbGx9PC9zcGFuXG5cdFx0XHQ+XG5cdFx0ezplbHNlIGlmIGNvbnNlbnRTdGF0ZS5hdXN9XG5cdFx0XHQ8aDI+YXVzLnBlcnNvbmFsaXNlZEFkdmVydGlzaW5nPC9oMj5cblx0XHRcdDxzcGFuXG5cdFx0XHRcdGRhdGEtcGVyc29uYWxpc2VkLWFkdmVydGlzaW5nPXtjb25zZW50U3RhdGUuYXVzXG5cdFx0XHRcdFx0LnBlcnNvbmFsaXNlZEFkdmVydGlzaW5nfVxuXHRcdFx0XHRjbGFzcz17Y29uc2VudFN0YXRlLmF1cy5wZXJzb25hbGlzZWRBZHZlcnRpc2luZyA/ICd5ZXMnIDogJ25vJ31cblx0XHRcdFx0Pntjb25zZW50U3RhdGUuYXVzLnBlcnNvbmFsaXNlZEFkdmVydGlzaW5nfTwvc3BhblxuXHRcdFx0PlxuXHRcdHs6ZWxzZX1cblx0XHRcdDxoMj7Cr1xcXyjjg4QpXy/CrzwvaDI+XG5cdFx0ey9pZn1cblx0PC9kaXY+XG5cblx0PG9sIGlkPVwiZXZlbnRzXCI+XG5cdFx0eyNlYWNoIGV2ZW50c0xpc3QgYXMgeyB0aXRsZSwgcGF5bG9hZCB9fVxuXHRcdFx0PGxpPlxuXHRcdFx0XHQ8ZGV0YWlscz5cblx0XHRcdFx0XHQ8c3VtbWFyeT57dGl0bGV9PC9zdW1tYXJ5PlxuXHRcdFx0XHRcdDxwcmU+e0pTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDQpfTwvcHJlPlxuXHRcdFx0XHQ8L2RldGFpbHM+XG5cdFx0XHQ8L2xpPlxuXHRcdHsvZWFjaH1cblx0PC9vbD5cbjwvbWFpbj5cblxuPHN0eWxlPlxuXHQqIHtcblx0XHRmb250LWZhbWlseTogU0ZNb25vLVJlZ3VsYXIsIENvbnNvbGFzLCBMaWJlcmF0aW9uIE1vbm8sIE1lbmxvLCBtb25vc3BhY2U7XG5cdFx0Zm9udC1zaXplOiAxMnB4O1xuXHR9XG5cblx0bWFpbiB7XG5cdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdHRvcDogMDtcblx0XHRib3R0b206IDA7XG5cdFx0bGVmdDogMDtcblx0XHRyaWdodDogMDtcblx0XHRkaXNwbGF5OiBncmlkO1xuXHRcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byA0MDBweDtcblx0XHRncmlkLXRlbXBsYXRlLXJvd3M6IGF1dG8gMWZyO1xuXHRcdGdyaWQtdGVtcGxhdGUtYXJlYXM6XG5cdFx0XHQnZm9vdGVyIHNpZGViYXInXG5cdFx0XHQnbWFpbiBzaWRlYmFyJztcblx0fVxuXG5cdG1haW4gPiAqIHtcblx0XHRvdmVyZmxvdzogYXV0bztcblx0fVxuXG5cdG5hdiB7XG5cdFx0Z3JpZC1hcmVhOiBmb290ZXI7XG5cdFx0cGFkZGluZzogMC41cmVtO1xuXHRcdGFsaWduLXNlbGY6IGVuZDtcblx0XHRib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuXHRcdHotaW5kZXg6IDE7XG5cdFx0ZGlzcGxheTogZmxleDtcblx0fVxuXG5cdG5hdiAqIHtcblx0XHRmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBTZWdvZSBVSSwgSGVsdmV0aWNhLFxuXHRcdFx0QXJpYWwsIHNhbnMtc2VyaWYsIEFwcGxlIENvbG9yIEVtb2ppLCBTZWdvZSBVSSBFbW9qaTtcblx0XHRtYXJnaW46IDAgMC4yNWVtIDA7XG5cdH1cblxuXHRuYXYgKiArICoge1xuXHRcdG1hcmdpbi1sZWZ0OiAwLjVlbTtcblx0XHRtYXgtd2lkdGg6IDUwJTtcblx0fVxuXG5cdCNjb25zZW50LXN0YXRlIHtcblx0XHRncmlkLWFyZWE6IG1haW47XG5cdFx0cGFkZGluZzogMXJlbTtcblx0fVxuXG5cdCNldmVudHMge1xuXHRcdGdyaWQtYXJlYTogc2lkZWJhcjtcblx0XHRsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XG5cdFx0cGFkZGluZzogMDtcblx0XHRib3JkZXItbGVmdDogYmxhY2sgc29saWQgMXB4O1xuXHRcdG92ZXJmbG93OiBhdXRvO1xuXHRcdG1hcmdpbjogMDtcblx0fVxuXG5cdCNldmVudHMgbGkge1xuXHRcdGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZWVlO1xuXHRcdHBhZGRpbmc6IDA7XG5cdH1cblxuXHQjZXZlbnRzIHByZSB7XG5cdFx0bWFyZ2luOiAwO1xuXHRcdGJhY2tncm91bmQtY29sb3I6IG9sZGxhY2U7XG5cdFx0Y29sb3I6IGRlZXBwaW5rO1xuXHRcdHBhZGRpbmc6IDAuNGVtIDAuNWVtO1xuXHR9XG5cblx0bGFiZWwge1xuXHRcdGRpc3BsYXk6IGlubGluZS1mbGV4O1xuXHRcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cdFx0cGFkZGluZzogMC4yNWVtO1xuXHRcdGJvcmRlci1yYWRpdXM6IDAuMjVlbTtcblx0XHRib3JkZXI6IHJnYmEoMCwgMCwgMCwgMC4xKSBzb2xpZCAxcHg7XG5cdH1cblxuXHRsYWJlbC5zZWxlY3RlZCB7XG5cdFx0YmFja2dyb3VuZC1jb2xvcjogbGlnaHRncmV5O1xuXHR9XG5cblx0c3VtbWFyeSB7XG5cdFx0Y3Vyc29yOiBwb2ludGVyO1xuXHRcdHBhZGRpbmc6IDAuMmVtIDAuNWVtO1xuXHR9XG5cblx0Lnllcyxcblx0Lm5vLFxuXHQubGFiZWwge1xuXHRcdGRpc3BsYXk6IGlubGluZS1mbGV4O1xuXHRcdG1pbi1oZWlnaHQ6IDEuNXJlbTtcblx0XHRtaW4td2lkdGg6IDEuNXJlbTtcblx0XHRhbGlnbi1pdGVtczogY2VudGVyO1xuXHRcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXHRcdG1hcmdpbi1yaWdodDogMXB4O1xuXHRcdG1hcmdpbi1ib3R0b206IDFweDtcblx0XHRmb250LXdlaWdodDogbm9ybWFsO1xuXHRcdHBhZGRpbmc6IDAgMWNoO1xuXHRcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG5cdH1cblxuXHQueWVzIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiBjaGFydHJldXNlO1xuXHR9XG5cblx0Lm5vIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAjZmYxYTRmO1xuXHR9XG5cblx0LmxhYmVsIHtcblx0XHR3aWR0aDogYXV0bztcblx0XHRmb250LXdlaWdodDogbm9ybWFsO1xuXHRcdGJhY2tncm91bmQtY29sb3I6IG9sZGxhY2U7XG5cdFx0Y29sb3I6IGRlZXBwaW5rO1xuXHR9XG5cblx0aDIge1xuXHRcdGZvbnQtd2VpZ2h0OiBub3JtYWw7XG5cdFx0bWFyZ2luOiAwIDAgMC4ycmVtO1xuXHR9XG5cblx0KiArIGgyIHtcblx0XHRtYXJnaW4tdG9wOiAxcmVtO1xuXHR9XG5cbjwvc3R5bGU+XG4iLCJpbXBvcnQgQXBwIGZyb20gJy4vQXBwLnN2ZWx0ZSc7XG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoe1xuXHR0YXJnZXQ6IGRvY3VtZW50LmJvZHksXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwO1xuIl0sIm5hbWVzIjpbIm5vb3AiLCJydW4iLCJmbiIsImJsYW5rX29iamVjdCIsIk9iamVjdCIsImNyZWF0ZSIsInJ1bl9hbGwiLCJmbnMiLCJmb3JFYWNoIiwiaXNfZnVuY3Rpb24iLCJ0aGluZyIsInNhZmVfbm90X2VxdWFsIiwiYSIsImIiLCJpc19lbXB0eSIsIm9iaiIsImtleXMiLCJsZW5ndGgiLCJudWxsX3RvX2VtcHR5IiwidmFsdWUiLCJhcHBlbmQiLCJ0YXJnZXQiLCJub2RlIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnQiLCJhbmNob3IiLCJpbnNlcnRCZWZvcmUiLCJkZXRhY2giLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJkZXN0cm95X2VhY2giLCJpdGVyYXRpb25zIiwiZGV0YWNoaW5nIiwiaSIsImQiLCJlbGVtZW50IiwibmFtZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInRleHQiLCJkYXRhIiwiY3JlYXRlVGV4dE5vZGUiLCJzcGFjZSIsImVtcHR5IiwibGlzdGVuIiwiZXZlbnQiLCJoYW5kbGVyIiwib3B0aW9ucyIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYXR0ciIsImF0dHJpYnV0ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImNoaWxkcmVuIiwiQXJyYXkiLCJmcm9tIiwiY2hpbGROb2RlcyIsInNldF9kYXRhIiwid2hvbGVUZXh0IiwiY3VycmVudF9jb21wb25lbnQiLCJzZXRfY3VycmVudF9jb21wb25lbnQiLCJjb21wb25lbnQiLCJnZXRfY3VycmVudF9jb21wb25lbnQiLCJFcnJvciIsIm9uTW91bnQiLCIkJCIsIm9uX21vdW50IiwicHVzaCIsImRpcnR5X2NvbXBvbmVudHMiLCJiaW5kaW5nX2NhbGxiYWNrcyIsInJlbmRlcl9jYWxsYmFja3MiLCJmbHVzaF9jYWxsYmFja3MiLCJyZXNvbHZlZF9wcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ1cGRhdGVfc2NoZWR1bGVkIiwic2NoZWR1bGVfdXBkYXRlIiwidGhlbiIsImZsdXNoIiwiYWRkX3JlbmRlcl9jYWxsYmFjayIsImZsdXNoaW5nIiwic2Vlbl9jYWxsYmFja3MiLCJTZXQiLCJ1cGRhdGUiLCJwb3AiLCJjYWxsYmFjayIsImhhcyIsImFkZCIsImNsZWFyIiwiZnJhZ21lbnQiLCJiZWZvcmVfdXBkYXRlIiwiZGlydHkiLCJwIiwiY3R4IiwiYWZ0ZXJfdXBkYXRlIiwib3V0cm9pbmciLCJ0cmFuc2l0aW9uX2luIiwiYmxvY2siLCJsb2NhbCIsImRlbGV0ZSIsIm1vdW50X2NvbXBvbmVudCIsImN1c3RvbUVsZW1lbnQiLCJvbl9kZXN0cm95IiwibSIsIm5ld19vbl9kZXN0cm95IiwibWFwIiwiZmlsdGVyIiwiZGVzdHJveV9jb21wb25lbnQiLCJtYWtlX2RpcnR5IiwiZmlsbCIsImluaXQiLCJpbnN0YW5jZSIsImNyZWF0ZV9mcmFnbWVudCIsIm5vdF9lcXVhbCIsInByb3BzIiwicGFyZW50X2NvbXBvbmVudCIsImJvdW5kIiwib25fZGlzY29ubmVjdCIsImNvbnRleHQiLCJNYXAiLCJjYWxsYmFja3MiLCJza2lwX2JvdW5kIiwicmVhZHkiLCJyZXQiLCJoeWRyYXRlIiwibm9kZXMiLCJsIiwiYyIsImludHJvIiwiU3ZlbHRlQ29tcG9uZW50IiwiJGRlc3Ryb3kiLCIkb24iLCJ0eXBlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiJHNldCIsIiQkcHJvcHMiLCIkJHNldCIsIl9fY2xhc3NQcml2YXRlRmllbGRTZXQiLCJyZWNlaXZlciIsInN0YXRlIiwia2luZCIsImYiLCJUeXBlRXJyb3IiLCJjYWxsIiwic2V0IiwiX19jbGFzc1ByaXZhdGVGaWVsZEdldCIsImdldCIsIl9TdG9yYWdlRmFjdG9yeV9zdG9yYWdlIiwiX2xvY2FsIiwiX3Nlc3Npb24iLCJfYSQyIiwiU3RvcmFnZUZhY3RvcnkiLCJjb25zdHJ1Y3RvciIsInN0b3JhZ2UiLCJ1aWQiLCJEYXRlIiwidG9TdHJpbmciLCJzZXRJdGVtIiwiYXZhaWxhYmxlIiwiZ2V0SXRlbSIsInJlbW92ZUl0ZW0iLCJlIiwiaXNBdmFpbGFibGUiLCJCb29sZWFuIiwia2V5IiwiZXhwaXJlcyIsIkpTT04iLCJwYXJzZSIsInJlbW92ZSIsInN0cmluZ2lmeSIsImdldFJhdyIsInNldFJhdyIsIldlYWtNYXAiLCJsb2NhbFN0b3JhZ2UiLCJzZXNzaW9uIiwic2Vzc2lvblN0b3JhZ2UiLCJ0ZWFtcyIsImNvbW1vbiIsImJhY2tncm91bmQiLCJmb250IiwiY29tbWVyY2lhbCIsImNtcCIsImRvdGNvbSIsImRlc2lnbiIsInR4IiwiX2EkMSIsIktFWSIsInRlYW1Db2xvdXJzIiwic3R5bGUiLCJ0ZWFtIiwibG9nIiwiaW5jbHVkZXMiLCJzdHlsZXMiLCJhcmdzIiwiY29uc29sZSIsInN1YnNjcmliZVRvIiwidGVhbVN1YnNjcmlwdGlvbnMiLCJzcGxpdCIsImpvaW4iLCJ1bnN1YnNjcmliZUZyb20iLCJ0Iiwid2luZG93IiwiZ3VhcmRpYW4iLCJsb2dnZXIiLCJjdXJyZW50RnJhbWV3b3JrIiwic2V0Q3VycmVudEZyYW1ld29yayIsImZyYW1ld29yayIsImdldEN1cnJlbnRGcmFtZXdvcmsiLCJtYXJrIiwibGFiZWwiLCJwZXJmb3JtYW5jZSIsImlzU2VydmVyU2lkZSIsInNlcnZlclNpZGVXYXJuIiwid2FybiIsInNlcnZlclNpZGVXYXJuQW5kUmV0dXJuIiwiYXJnIiwiY21wJDEiLCJfX2Rpc2FibGUiLCJfX2VuYWJsZSIsIl9faXNEaXNhYmxlZCIsImhhc0luaXRpYWxpc2VkIiwic2hvd1ByaXZhY3lNYW5hZ2VyIiwidmVyc2lvbiIsIndpbGxTaG93UHJpdmFjeU1lc3NhZ2UiLCJ3aWxsU2hvd1ByaXZhY3lNZXNzYWdlU3luYyIsIm9uQ29uc2VudENoYW5nZSQyIiwiZ2V0Q29uc2VudEZvciQyIiwidmVuZG9yIiwiY29uc2VudCIsImlzR3VhcmRpYW4iLCJpc0d1YXJkaWFuRG9tYWluIiwibG9jYXRpb24iLCJob3N0IiwiZW5kc1dpdGgiLCJBQ0NPVU5UX0lEIiwiUFJJVkFDWV9NQU5BR0VSX0NDUEEiLCJQUklWQUNZX01BTkFHRVJfVENGVjIiLCJQUklWQUNZX01BTkFHRVJfQVVTVFJBTElBIiwiRU5EUE9JTlQiLCJhcGkkMiIsImNvbW1hbmQiLCJyZWplY3QiLCJfX3VzcGFwaSIsInJlc3VsdCIsInN1Y2Nlc3MiLCJnZXRVU1BEYXRhJDEiLCJnZXRDb25zZW50U3RhdGUkMyIsInVzcERhdGEiLCJvcHRlZE91dCIsInVzcFN0cmluZyIsImNoYXJBdCIsInBlcnNvbmFsaXNlZEFkdmVydGlzaW5nIiwiYXBpJDEiLCJnZXRVU1BEYXRhIiwiZ2V0Q29uc2VudFN0YXRlJDIiLCJkb05vdFNlbGwiLCJhcGkiLCJfX3RjZmFwaSIsImdldFRDRGF0YSIsImdldEN1c3RvbVZlbmRvckNvbnNlbnRzIiwiZGVmYXVsdENvbnNlbnRzIiwiZ2V0Q29uc2VudFN0YXRlJDEiLCJ0Y0RhdGEiLCJjdXN0b21WZW5kb3JzIiwiYWxsIiwiY29uc2VudHMiLCJwdXJwb3NlIiwiZXZlbnRTdGF0dXMiLCJnZHByQXBwbGllcyIsInRjU3RyaW5nIiwiYWRkdGxDb25zZW50IiwiZ3JhbnRzIiwidmVuZG9yQ29uc2VudHMiLCJzb3J0IiwicmVkdWNlIiwiYWNjIiwiY3VyIiwidmVuZG9yR3JhbnQiLCJjYWxsQmFja1F1ZXVlIiwiYXdhaXRpbmdVc2VySW50ZXJhY3Rpb25JblRDRnYyIiwidGNmdjIiLCJpbnZva2VDYWxsYmFjayIsInN0YXRlU3RyaW5nIiwibGFzdFN0YXRlIiwiZ2V0Q29uc2VudFN0YXRlIiwiYXVzIiwiY2NwYSIsImludm9rZUNhbGxiYWNrcyIsIm9uQ29uc2VudENoYW5nZSQxIiwiY2FsbEJhY2siLCJuZXdDYWxsYmFjayIsImNvbnNlbnRTdGF0ZSIsImNhdGNoIiwic3R1Yl9jY3BhIiwiciIsImZyYW1lcyIsImJvZHkiLCJjc3NUZXh0Iiwic2V0VGltZW91dCIsImFyZ3VtZW50cyIsImdkcHJBcHBsaWVzR2xvYmFsbHkiLCJjbXBMb2FkZWQiLCJzbGljZSIsImFwcGx5IiwiX19jbXBDYWxsIiwibiIsInBhcmFtZXRlciIsIl9fY21wUmV0dXJuIiwicmV0dXJuVmFsdWUiLCJjYWxsSWQiLCJzb3VyY2UiLCJwb3N0TWVzc2FnZSIsIm1zZ0hhbmRsZXIiLCJzdHViX3RjZnYyIiwiZXhwb3J0cyIsIm8iLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsIl9fZXNNb2R1bGUiLCJiaW5kIiwiZGVmYXVsdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwicyIsIl9fdGNmYXBpTG9jYXRvciIsInBhcnNlSW50IiwiYXBpVmVyc2lvbiIsIl9fdGNmYXBpQ2FsbCIsIl9fdGNmYXBpUmV0dXJuIiwiRnVuY3Rpb24iLCJ1IiwiY29uZmlndXJhYmxlIiwibWF0Y2giLCJNYXRoIiwiZ2xvYmFsVGhpcyIsInNlbGYiLCJTdHJpbmciLCJ2YWx1ZU9mIiwic3R1YiIsInJlc29sdmVXaWxsU2hvd1ByaXZhY3lNZXNzYWdlIiwid2lsbFNob3dQcml2YWN5TWVzc2FnZSQyIiwiZ2V0UHJvcGVydHkiLCJpbml0JDIiLCJwdWJEYXRhIiwiX3NwXyIsImZyYW1ld29ya01lc3NhZ2VUeXBlIiwiX3NwX3F1ZXVlIiwiY29uZmlnIiwiYmFzZUVuZHBvaW50IiwiYWNjb3VudElkIiwicHJvcGVydHlIcmVmIiwidGFyZ2V0aW5nUGFyYW1zIiwiY21wSW5pdFRpbWVVdGMiLCJnZXRUaW1lIiwiZXZlbnRzIiwib25Db25zZW50UmVhZHkiLCJtZXNzYWdlX3R5cGUiLCJjb25zZW50VVVJRCIsImV1Y29uc2VudCIsIm9uTWVzc2FnZVJlYWR5Iiwib25NZXNzYWdlUmVjZWl2ZURhdGEiLCJtZXNzYWdlSWQiLCJvbk1lc3NhZ2VDaG9pY2VTZWxlY3QiLCJjaG9pY2VfaWQiLCJjaG9pY2VUeXBlSUQiLCJvblByaXZhY3lNYW5hZ2VyQWN0aW9uIiwicG1EYXRhIiwib25NZXNzYWdlQ2hvaWNlRXJyb3IiLCJlcnIiLCJvblBNQ2FuY2VsIiwib25TUFBNT2JqZWN0UmVhZHkiLCJvbkVycm9yIiwiZXJyb3JDb2RlIiwiZXJyb3JPYmplY3QiLCJ1c2VyUmVzZXQiLCJnZHByIiwic3BMaWIiLCJpZCIsInNyYyIsImluaXQkMSIsIndpbGxTaG93UHJpdmFjeU1lc3NhZ2UkMSIsInNob3dQcml2YWN5TWFuYWdlciQxIiwibG9hZFByaXZhY3lNYW5hZ2VyTW9kYWwiLCJDTVAiLCJDT09LSUVfTkFNRSIsImRpc2FibGUiLCJjb29raWUiLCJlbmFibGUiLCJpc0Rpc2FibGVkIiwiUmVnRXhwIiwidGVzdCIsIlZlbmRvcklEcyIsImE5IiwiYWNhc3QiLCJicmF6ZSIsImNvbXNjb3JlIiwiZmIiLCJnb29nbGV0YWciLCJpYXMiLCJpbml6aW8iLCJpcHNvcyIsImxvdGFtZSIsIm5pZWxzZW4iLCJvcGhhbiIsInBlcm11dGl2ZSIsInByZWJpZCIsInJlZHBsYW5ldCIsInJlbWFya2V0aW5nIiwic2VudHJ5IiwidGVhZHMiLCJ0d2l0dGVyIiwiZ2V0Q29uc2VudEZvciQxIiwic291cmNlcG9pbnRJZHMiLCJmb3VuZFNvdXJjZXBvaW50SWQiLCJmaW5kIiwidGNmdjJDb25zZW50IiwiZ2V0RnJhbWV3b3JrIiwiY291bnRyeUNvZGUiLCJfYSIsIl9iIiwiX2MiLCJndUNtcEhvdEZpeCIsIl93aWxsU2hvd1ByaXZhY3lNZXNzYWdlIiwiaW5pdENvbXBsZXRlIiwicmVzb2x2ZUluaXRpYWxpc2VkIiwiaW5pdGlhbGlzZWQiLCJjb3VudHJ5Iiwid2lsbFNob3dWYWx1ZSIsInVuZGVmaW5lZCIsIm9uQ29uc2VudENoYW5nZSIsImdldENvbnNlbnRGb3IiLCJ0aGlzIiwiYXBwIiwiQXBwIl0sIm1hcHBpbmdzIjoiOztBQUFBLFNBQVNBLElBQVQsR0FBZ0IsRUFBRzs7QUFnQm5CLFNBQVNDLEdBQVQsQ0FBYUMsRUFBYixFQUFpQjtBQUNiLEVBQUEsT0FBT0EsRUFBRSxFQUFULENBQUE7QUFDSCxDQUFBOztBQUNELFNBQVNDLFlBQVQsR0FBd0I7QUFDcEIsRUFBQSxPQUFPQyxNQUFNLENBQUNDLE1BQVAsQ0FBYyxJQUFkLENBQVAsQ0FBQTtBQUNILENBQUE7O0FBQ0QsU0FBU0MsT0FBVCxDQUFpQkMsR0FBakIsRUFBc0I7QUFDbEJBLEVBQUFBLEdBQUcsQ0FBQ0MsT0FBSixDQUFZUCxHQUFaLENBQUEsQ0FBQTtBQUNILENBQUE7O0FBQ0QsU0FBU1EsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEI7QUFDeEIsRUFBTyxPQUFBLE9BQU9BLEtBQVAsS0FBaUIsVUFBeEIsQ0FBQTtBQUNILENBQUE7O0FBQ0QsU0FBU0MsY0FBVCxDQUF3QkMsQ0FBeEIsRUFBMkJDLENBQTNCLEVBQThCO0FBQzFCLEVBQU9ELE9BQUFBLENBQUMsSUFBSUEsQ0FBTCxHQUFTQyxDQUFDLElBQUlBLENBQWQsR0FBa0JELENBQUMsS0FBS0MsQ0FBTixJQUFhRCxDQUFD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
