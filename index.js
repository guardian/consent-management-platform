function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function r(e){return"function"==typeof e}function a(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(e){return null==e?"":e}function i(e,t){e.appendChild(t)}function s(e,t,n){e.insertBefore(t,n||null)}function l(e){e.parentNode.removeChild(e)}function u(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function d(e){return document.createElement(e)}function f(e){return document.createTextNode(e)}function p(){return f(" ")}function v(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function g(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function h(e){return Array.from(e.childNodes)}function m(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}var w;function y(e){w=e}function b(e){(function(){if(!w)throw new Error("Function called outside component initialization");return w})().$$.on_mount.push(e)}var _=[],S=[],C=[],k=[],O=Promise.resolve(),x=!1;function P(e){C.push(e)}var j=new Set,M=0;function $(){var e=w;do{for(;M<_.length;){var t=_[M];M++,y(t),E(t.$$)}for(y(null),_.length=0,M=0;S.length;)S.pop()();for(var n=0;n<C.length;n+=1){var o=C[n];j.has(o)||(j.add(o),o())}C.length=0}while(_.length);for(;k.length;)k.pop()();x=!1,j.clear(),y(e)}function E(e){if(null!==e.fragment){e.update(),o(e.before_update);var t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(P)}}var F=new Set;function N(e,t){e&&e.i&&(F.delete(e),e.i(t))}function A(e,n,a,c){var{fragment:i,after_update:s}=e.$$;i&&i.m(n,a),c||P((()=>{var n=e.$$.on_mount.map(t).filter(r);e.$$.on_destroy?e.$$.on_destroy.push(...n):o(n),e.$$.on_mount=[]})),s.forEach(P)}function T(e,t){-1===e.$$.dirty[0]&&(_.push(e),x||(x=!0,O.then($)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function I(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function D(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?I(Object(n),!0).forEach((function(t){U(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):I(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function J(e,t,n,o,r,a,c){try{var i=e[a](c),s=i.value}catch(e){return void n(e)}i.done?t(s):Promise.resolve(s).then(o,r)}function R(e){return function(){var t=this,n=arguments;return new Promise((function(o,r){var a=e.apply(t,n);function c(e){J(a,o,r,c,i,"next",e)}function i(e){J(a,o,r,c,i,"throw",e)}c(void 0)}))}}function U(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function H(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}(e,B(e,t,"get"))}function L(e,t,n){return function(e,t,n){if(t.set)t.set.call(e,n);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=n}}(e,B(e,t,"set"),n),n}function B(e,t,n){if(!t.has(e))throw new TypeError("attempted to "+n+" private field on non-instance");return t.get(e)}var W,G,V=e=>"[object String]"===Object.prototype.toString.call(e),q=new WeakMap;class z{constructor(e){q.set(this,{writable:!0,value:void 0});try{var t=window[e],n=(new Date).toString();t.setItem(n,n);var o=t.getItem(n)==n;t.removeItem(n),o&&L(this,q,t)}catch(e){}}isAvailable(){return Boolean(H(this,q))}get(e){try{var t,n,o=JSON.parse(null!==(t=null===(n=H(this,q))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:"");if(!(e=>{if("[object Object]"!==Object.prototype.toString.call(e))return!1;var t=Object.getPrototypeOf(e);return null===t||t===Object.prototype})(o))return null;var{value:r,expires:a}=o;return V(a)&&new Date>new Date(a)?(this.remove(e),null):r}catch(e){return null}}set(e,t,n){var o;return null===(o=H(this,q))||void 0===o?void 0:o.setItem(e,JSON.stringify({value:t,expires:n}))}remove(e){var t;return null===(t=H(this,q))||void 0===t?void 0:t.removeItem(e)}clear(){var e;return null===(e=H(this,q))||void 0===e?void 0:e.clear()}getRaw(e){var t,n;return null!==(t=null===(n=H(this,q))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:null}setRaw(e,t){var n;return null===(n=H(this,q))||void 0===n?void 0:n.setItem(e,t)}}var Y,K,Q=new(W=new WeakMap,G=new WeakMap,class{constructor(){W.set(this,{writable:!0,value:void 0}),G.set(this,{writable:!0,value:void 0})}get local(){return H(this,W)||L(this,W,new z("localStorage"))}get session(){return H(this,G)||L(this,G,new z("sessionStorage"))}}),X={commercial:{background:"#77EEAA",font:"#004400"},cmp:{background:"#FF6BB5",font:"#2F0404"},dotcom:{background:"#000000",font:"#ff7300"},design:{background:"#185E36",font:"#FFF4F2"},tx:{background:"#2F4F4F",font:"#FFFFFF"},supporterRevenue:{background:"#0F70B7",font:"#ffffff"},identity:{background:"#6F5F8F",font:"#ffffff"}},Z=e=>Object.keys(X).includes(e),ee=D(D({},X),{common:{background:"#052962",font:"#ffffff"}}),te=e=>{var{background:t,font:n}=ee[e];return"background: ".concat(t,"; color: ").concat(n,"; padding: 2px 3px; border-radius:3px")},ne=()=>{var e=Q.local.get("gu.logger");return V(e)?e.split(",").filter(Z):[]};"undefined"!=typeof window&&((Y=window).guardian||(Y.guardian={}),(K=window.guardian).logger||(K.logger={subscribeTo:e=>{var t=ne();t.includes(e)||t.push(e),Q.local.set("gu.logger",t.join(",")),ce(e,"🔔 Subscribed, hello!")},unsubscribeFrom:e=>{ce(e,"🔕 Unsubscribed, good-bye!");var t=ne().filter((t=>t!==e));Q.local.set("gu.logger",t.join(","))},teams:()=>Object.keys(X)}));var oe,re,ae,ce=function(e){if(ne().includes(e)){for(var t=[te("common"),"",te(e),""],n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];console.log("%c@guardian%c %c".concat(e,"%c"),...t,...o)}},ie=e=>{ce("cmp","Framework set to ".concat(e)),oe=e},se=()=>oe,le=e=>{var t,n;null===(t=window.performance)||void 0===t||null===(n=t.mark)||void 0===n||n.call(t,e),ce("cmp","[event]",e)},ue="undefined"==typeof window,de=()=>{console.warn("This is a server-side version of the @guardian/consent-management-platform","No consent signals will be received.")},fe=e=>()=>(de(),e),pe={__disable:de,__enable:fe(!1),__isDisabled:fe(!1),hasInitialised:fe(!1),init:de,showPrivacyManager:de,version:"n/a",willShowPrivacyMessage:fe(Promise.resolve(!1)),willShowPrivacyMessageSync:fe(!1)},ve=()=>(void 0===re&&(re=!!ue||window.location.host.endsWith(".theguardian.com")),re),ge=ve()?"https://sourcepoint.theguardian.com":"https://cdn.privacy-mgmt.com",he=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},me=function(){var e=R((function*(){return{personalisedAdvertising:!("Y"===(yield he()).uspString.charAt(2))}}));return function(){return e.apply(this,arguments)}}(),we=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},ye=function(){var e=R((function*(){return{doNotSell:"Y"===(yield we()).uspString.charAt(2)}}));return function(){return e.apply(this,arguments)}}(),be=e=>new Promise(((t,n)=>{window.__tcfapi?window.__tcfapi(e,2,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __tcfapi found on window"))})),_e={1:!1,2:!1,3:!1,4:!1,5:!1,6:!1,7:!1,8:!1,9:!1,10:!1},Se=function(){var e=R((function*(){var[e,t]=yield Promise.all([be("getTCData"),be("getCustomVendorConsents")]);if(void 0===e){var n,o=null!==(n=se())&&void 0!==n?n:"undefined";throw new Error("No TC Data found with current framework: ".concat(o))}var r=D(D({},_e),e.purpose.consents),{eventStatus:a,gdprApplies:c,tcString:i,addtlConsent:s}=e,{grants:l}=t;return{consents:r,eventStatus:a,vendorConsents:Object.keys(l).sort().reduce(((e,t)=>D(D({},e),{},{[t]:l[t].vendorGrant})),{}),addtlConsent:s,gdprApplies:c,tcString:i}}));return function(){return e.apply(this,arguments)}}(),Ce=[],ke=e=>{var t;return"cmpuishown"===(null===(t=e.tcfv2)||void 0===t?void 0:t.eventStatus)},Oe=(e,t)=>{if(!ke(t)){var n=JSON.stringify(t);n!==e.lastState&&(e.fn(t),e.lastState=n)}},xe=e=>{var t=ue?void 0:navigator.globalPrivacyControl;if(e.tcfv2){var n=e.tcfv2.consents;return D(D({},e),{},{canTarget:Object.keys(n).length>0&&Object.values(n).every(Boolean),framework:"tcfv2",gpcSignal:t})}return e.ccpa?D(D({},e),{},{canTarget:!e.ccpa.doNotSell,framework:"ccpa",gpcSignal:t}):e.aus?D(D({},e),{},{canTarget:e.aus.personalisedAdvertising,framework:"aus",gpcSignal:t}):D(D({},e),{},{canTarget:!1,framework:null,gpcSignal:t})},Pe=function(){var e=R((function*(){switch(se()){case"aus":return xe({aus:yield me()});case"ccpa":return xe({ccpa:yield ye()});case"tcfv2":return xe({tcfv2:yield Se()});default:throw new Error("no IAB consent framework found on the page")}}));return function(){return e.apply(this,arguments)}}(),je=()=>{0!==Ce.length&&Pe().then((e=>{ke(e)||Ce.forEach((t=>Oe(t,e)))}))},Me=e=>{var t={fn:e};Ce.push(t),Pe().then((e=>{Oe(t,e)})).catch((()=>{}))},$e=()=>{!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){var o=n(2);e.exports=!o((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t,n){n(4),function(){if("function"!=typeof window.__tcfapi){var e,t=[],n=window,o=n.document;!n.__tcfapi&&function e(){var t=!!n.frames.__tcfapiLocator;if(!t)if(o.body){var r=o.createElement("iframe");r.style.cssText="display:none",r.name="__tcfapiLocator",o.body.appendChild(r)}else setTimeout(e,5);return!t}()&&(n.__tcfapi=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];if(!o.length)return t;if("setGdprApplies"===o[0])o.length>3&&2===parseInt(o[1],10)&&"boolean"==typeof o[3]&&(e=o[3],"function"==typeof o[2]&&o[2]("set",!0));else if("ping"===o[0]){var a={gdprApplies:e,cmpLoaded:!1,apiVersion:"2.0"};"function"==typeof o[2]&&o[2](a,!0)}else t.push(o)},n.addEventListener("message",(function(e){var t="string"==typeof e.data,o={};try{o=t?JSON.parse(e.data):e.data}catch(e){}var r=o.__tcfapiCall;r&&n.__tcfapi(r.command,r.version,(function(n,o){var a={__tcfapiReturn:{returnValue:n,success:o,callId:r.callId}};t&&(a=JSON.stringify(a)),e.source.postMessage(a,"*")}),r.parameter)}),!1))}}()},function(e,t,n){var o=n(0),r=n(5).f,a=Function.prototype,c=a.toString,i=/^s*function ([^ (]*)/;o&&!("name"in a)&&r(a,"name",{configurable:!0,get:function(){try{return c.call(this).match(i)[1]}catch(e){return""}}})},function(e,t,n){var o=n(0),r=n(6),a=n(10),c=n(11),i=Object.defineProperty;t.f=o?i:function(e,t,n){if(a(e),t=c(t,!0),a(n),r)try{return i(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(e[t]=n.value),e}},function(e,t,n){var o=n(0),r=n(2),a=n(7);e.exports=!o&&!r((function(){return 7!=Object.defineProperty(a("div"),"a",{get:function(){return 7}}).a}))},function(e,t,n){var o=n(8),r=n(1),a=o.document,c=r(a)&&r(a.createElement);e.exports=function(e){return c?a.createElement(e):{}}},function(e,t,n){(function(t){var n=function(e){return e&&e.Math==Math&&e};e.exports=n("object"==typeof globalThis&&globalThis)||n("object"==typeof window&&window)||n("object"==typeof self&&self)||n("object"==typeof t&&t)||Function("return this")()}).call(this,n(9))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){var o=n(1);e.exports=function(e){if(!o(e))throw TypeError(String(e)+" is not an object");return e}},function(e,t,n){var o=n(1);e.exports=function(e,t){if(!o(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!o(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")}}])},Ee=e=>{"tcfv2"===e?$e():function(){var e=window,t=document;function n(t){var n="string"==typeof t.data;try{var o=n?JSON.parse(t.data):t.data;if(o.__cmpCall){var r=o.__cmpCall;e.__uspapi(r.command,r.parameter,(function(e,o){var a={__cmpReturn:{returnValue:e,success:o,callId:r.callId}};t.source.postMessage(n?JSON.stringify(a):a,"*")}))}}catch(o){}}!function n(){if(!e.frames.__uspapiLocator)if(t.body){var o=t.body,r=t.createElement("iframe");r.style.cssText="display:none",r.name="__uspapiLocator",o.appendChild(r)}else setTimeout(n,5)}(),"function"!=typeof __uspapi&&(e.__uspapi=function(){var e=arguments;if(__uspapi.a=__uspapi.a||[],!e.length)return __uspapi.a;"ping"===e[0]?e[2]({gdprAppliesGlobally:!1,cmpLoaded:!1},!0):__uspapi.a.push([].slice.apply(e))},__uspapi.msgHandler=n,e.addEventListener("message",n,!1))}()},Fe=new Promise((e=>{ae=e})),Ne=e=>"aus"==e?"https://au.theguardian.com":ve()?null:"https://test.theguardian.com";var Ae,Te,Ie,De,Je,Re=(e,t)=>{le("cmp-init"),function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(Ee(e),window._sp_)throw new Error("Sourcepoint global (window._sp_) is already defined!");ie(e),je();var n="tcfv2"==e?"gdpr":"ccpa";ce("cmp","framework: ".concat(e)),ce("cmp","frameworkMessageType: ".concat(n)),window._sp_queue=[],window._sp_={config:{baseEndpoint:ge,accountId:1257,propertyHref:Ne(e),targetingParams:{framework:e},pubData:D(D({},t),{},{cmpInitTimeUtc:(new Date).getTime()}),events:{onConsentReady:(e,t,o)=>{ce("cmp","onConsentReady ".concat(e)),e==n&&(ce("cmp","consentUUID ".concat(t)),ce("cmp","euconsent ".concat(o)),le("cmp-got-consent"),setTimeout(je,0))},onMessageReady:e=>{ce("cmp","onMessageReady ".concat(e)),e==n&&le("cmp-ui-displayed")},onMessageReceiveData:(e,t)=>{ce("cmp","onMessageReceiveData ".concat(e)),e==n&&(ce("cmp","onMessageReceiveData ",t),ae(0!==t.messageId))},onMessageChoiceSelect:(e,t,o)=>{ce("cmp","onMessageChoiceSelect message_type: ".concat(e)),console.log(),e==n&&(ce("cmp","onMessageChoiceSelect choice_id: ".concat(t)),ce("cmp","onMessageChoiceSelect choice_type_id: ".concat(o)),11!==o&&13!==o&&15!==o||setTimeout(je,0))},onPrivacyManagerAction:function(e,t){ce("cmp","onPrivacyManagerAction message_type: ".concat(e)),e==n&&ce("cmp","onPrivacyManagerAction ".concat(t))},onMessageChoiceError:function(e,t){ce("cmp","onMessageChoiceError ".concat(e)),e==n&&ce("cmp","onMessageChoiceError ".concat(t))},onPMCancel:function(e){ce("cmp","onPMCancel ".concat(e))},onSPPMObjectReady:function(){ce("cmp","onSPPMObjectReady")},onError:function(e,t,o,r){ce("cmp","errorCode: ".concat(e)),e==n&&(ce("cmp","errorCode: ".concat(t)),ce("cmp",o),ce("cmp","userReset: ".concat(r)))}}}},"tcfv2"===e?window._sp_.config.gdpr={targetingParams:{framework:e}}:window._sp_.config.ccpa={targetingParams:{framework:e}};var o=document.createElement("script");o.id="sourcepoint-lib",o.src="".concat(ge,"/unified/wrapperMessagingWithoutDetection.js"),document.body.appendChild(o)}(e,t)},Ue=()=>Fe,He=function(){var e,t,n,o,r,a,c,i,s;switch(se()){case"tcfv2":null===(e=window._sp_)||void 0===e||null===(t=e.gdpr)||void 0===t||null===(n=t.loadPrivacyManagerModal)||void 0===n||n.call(t,106842);break;case"ccpa":null===(o=window._sp_)||void 0===o||null===(r=o.ccpa)||void 0===r||null===(a=r.loadPrivacyManagerModal)||void 0===a||a.call(r,540252);break;case"aus":null===(c=window._sp_)||void 0===c||null===(i=c.ccpa)||void 0===i||null===(s=i.loadPrivacyManagerModal)||void 0===s||s.call(i,540341)}},Le=()=>new RegExp("".concat("gu-cmp-disabled","=true(\\W+|$)")).test(document.cookie),Be={a9:["5f369a02b8e05c308701f829"],acast:["5f203dcb1f0dea790562e20f"],braze:["5ed8c49c4b8ce4571c7ad801"],comscore:["5efefe25b8e05c06542b2a77"],fb:["5e7e1298b8e05c54a85c52d2"],"google-analytics":["5e542b3a4cd8884eb41b5a72"],"google-mobile-ads":["5f1aada6b8e05c306c0597d7"],"google-tag-manager":["5e952f6107d9d20c88e7c975"],googletag:["5f1aada6b8e05c306c0597d7"],ias:["5e7ced57b8e05c485246ccf3"],inizio:["5e37fc3e56a5e6615502f9c9"],ipsos:["5f745ab96f3aae0163740409"],linkedin:["5f2d22a6b8e05c02aa283b3c"],lotame:["5ed6aeb1b8e05c241a63c71f"],nielsen:["5ef5c3a5b8e05c69980eaa5b"],ophan:["5f203dbeeaaaa8768fd3226a"],permutive:["5eff0d77969bfa03746427eb"],prebid:["5f92a62aa22863685f4daa4c"],qm:["5f295fa4b8e05c76a44c3149"],redplanet:["5f199c302425a33f3f090f51"],remarketing:["5ed0eb688a76503f1016578f"],sentry:["5f0f39014effda6e8bbd2006"],teads:["5eab3d5ab8e05c2bbe33f399"],twitter:["5e71760b69966540e4554f01"],"youtube-player":["5e7ac3fae30e7d1bc1ebf5e8"]};ue||window.guCmpHotFix||(window.guCmpHotFix={});var We,Ge=!1,Ve=new Promise((e=>{We=e})),qe=ue?pe:(Ae=window.guCmpHotFix).cmp||(Ae.cmp={init:e=>{var{pubData:t,country:n}=e;if(!Le()&&!ue)if(window.guCmpHotFix.initialised){var o,r;"0.0.0-this-never-updates-in-source-code-refer-to-git-tags"!==(null===(o=window.guCmpHotFix.cmp)||void 0===o?void 0:o.version)&&console.warn("Two different versions of the CMP are running:",["0.0.0-this-never-updates-in-source-code-refer-to-git-tags",null===(r=window.guCmpHotFix.cmp)||void 0===r?void 0:r.version])}else{if(window.guCmpHotFix.initialised=!0,void 0===n)throw new Error("CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.");var a=(e=>{var t;switch(e){case"US":t="ccpa";break;case"AU":t="aus";break;case"GB":default:t="tcfv2"}return t})(n);Re(a,null!=t?t:{}),Ue().then((e=>{Je=e,Ge=!0,ce("cmp","initComplete")})),We()}},willShowPrivacyMessage:()=>Ve.then((()=>Ue())),willShowPrivacyMessageSync:()=>{if(void 0!==Je)return Je;throw new Error("CMP has not been initialised. Use the async willShowPrivacyMessage() instead.")},hasInitialised:()=>Ge,showPrivacyManager:()=>{Ve.then(He)},version:"0.0.0-this-never-updates-in-source-code-refer-to-git-tags",__isDisabled:Le,__enable:()=>{document.cookie="".concat("gu-cmp-disabled","=false")},__disable:()=>{document.cookie="".concat("gu-cmp-disabled","=true")}});ue||(Te=window.guCmpHotFix).onConsent||(Te.onConsent=()=>new Promise(((e,t)=>{Me((n=>{(n.tcfv2||n.ccpa||n.aus)&&e(n),t("Unknown framework")}))})));var ze=ue?()=>de():(Ie=window.guCmpHotFix).onConsentChange||(Ie.onConsentChange=Me);function Ye(e,t,n){const o=e.slice();return o[10]=t[n].title,o[11]=t[n].payload,o}function Ke(e,t,n){const o=e.slice();return o[14]=t[n][0],o[15]=t[n][1],o}function Qe(e,t,n){const o=e.slice();return o[18]=t[n][0],o[15]=t[n][1],o}function Xe(t){let n;return{c(){n=d("h2"),n.textContent="¯\\_(ツ)_/¯",g(n,"class","svelte-hrypa8")},m(e,t){s(e,n,t)},p:e,d(e){e&&l(n)}}}function Ze(e){let t,n,o,r,a,u,v=e[1].aus.personalisedAdvertising+"";return{c(){t=d("h2"),t.textContent="aus.personalisedAdvertising",n=p(),o=d("span"),r=f(v),g(t,"class","svelte-hrypa8"),g(o,"data-personalised-advertising",a=e[1].aus.personalisedAdvertising),g(o,"class",u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")},m(e,a){s(e,t,a),s(e,n,a),s(e,o,a),i(o,r)},p(e,t){2&t&&v!==(v=e[1].aus.personalisedAdvertising+"")&&m(r,v),2&t&&a!==(a=e[1].aus.personalisedAdvertising)&&g(o,"data-personalised-advertising",a),2&t&&u!==(u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")&&g(o,"class",u)},d(e){e&&l(t),e&&l(n),e&&l(o)}}}function et(e){let t,n,o,r,a,c=e[1].ccpa.doNotSell+"";return{c(){t=d("h2"),t.textContent="ccpa.doNotSell",n=p(),o=d("span"),r=f(c),g(t,"class","svelte-hrypa8"),g(o,"class","label svelte-hrypa8"),g(o,"data-donotsell",a=e[1].ccpa.doNotSell)},m(e,a){s(e,t,a),s(e,n,a),s(e,o,a),i(o,r)},p(e,t){2&t&&c!==(c=e[1].ccpa.doNotSell+"")&&m(r,c),2&t&&a!==(a=e[1].ccpa.doNotSell)&&g(o,"data-donotsell",a)},d(e){e&&l(t),e&&l(n),e&&l(o)}}}function tt(e){let t,n,o,r,a,c,v,h,w,y,b,_=e[1].tcfv2.eventStatus+"",S=Object.entries(e[1].tcfv2.consents),C=[];for(let t=0;t<S.length;t+=1)C[t]=nt(Qe(e,S,t));let k=Object.entries(e[1].tcfv2.vendorConsents),O=[];for(let t=0;t<k.length;t+=1)O[t]=ot(Ke(e,k,t));return{c(){t=d("h2"),t.textContent="tcfv2.eventStatus",n=p(),o=d("span"),r=f(_),a=p(),c=d("h2"),c.textContent="tcfv2.consents",v=p();for(let e=0;e<C.length;e+=1)C[e].c();h=p(),w=d("h2"),w.textContent="tcfv2.vendorConsents",y=p();for(let e=0;e<O.length;e+=1)O[e].c();b=f(""),g(t,"class","svelte-hrypa8"),g(o,"class","label svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(w,"class","svelte-hrypa8")},m(e,l){s(e,t,l),s(e,n,l),s(e,o,l),i(o,r),s(e,a,l),s(e,c,l),s(e,v,l);for(let t=0;t<C.length;t+=1)C[t].m(e,l);s(e,h,l),s(e,w,l),s(e,y,l);for(let t=0;t<O.length;t+=1)O[t].m(e,l);s(e,b,l)},p(e,t){if(2&t&&_!==(_=e[1].tcfv2.eventStatus+"")&&m(r,_),2&t){let n;for(S=Object.entries(e[1].tcfv2.consents),n=0;n<S.length;n+=1){const o=Qe(e,S,n);C[n]?C[n].p(o,t):(C[n]=nt(o),C[n].c(),C[n].m(h.parentNode,h))}for(;n<C.length;n+=1)C[n].d(1);C.length=S.length}if(2&t){let n;for(k=Object.entries(e[1].tcfv2.vendorConsents),n=0;n<k.length;n+=1){const o=Ke(e,k,n);O[n]?O[n].p(o,t):(O[n]=ot(o),O[n].c(),O[n].m(b.parentNode,b))}for(;n<O.length;n+=1)O[n].d(1);O.length=k.length}},d(e){e&&l(t),e&&l(n),e&&l(o),e&&l(a),e&&l(c),e&&l(v),u(C,e),e&&l(h),e&&l(w),e&&l(y),u(O,e),e&&l(b)}}}function nt(e){let t,n,o,r,a,u=e[18]+"";return{c(){t=d("span"),n=f(u),g(t,"class",o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8"),g(t,"data-purpose",r=e[18]),g(t,"data-consent",a=e[15])},m(e,o){s(e,t,o),i(t,n)},p(e,i){2&i&&u!==(u=e[18]+"")&&m(n,u),2&i&&o!==(o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",o),2&i&&r!==(r=e[18])&&g(t,"data-purpose",r),2&i&&a!==(a=e[15])&&g(t,"data-consent",a)},d(e){e&&l(t)}}}function ot(e){let t,n,o,r=e[14]+"";return{c(){t=d("span"),n=f(r),g(t,"class",o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")},m(e,o){s(e,t,o),i(t,n)},p(e,a){2&a&&r!==(r=e[14]+"")&&m(n,r),2&a&&o!==(o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",o)},d(e){e&&l(t)}}}function rt(e){let t,n,o,r,a,c,u,v,h=e[10]+"",w=JSON.stringify(e[11],null,4)+"";return{c(){t=d("li"),n=d("details"),o=d("summary"),r=f(h),a=p(),c=d("pre"),u=f(w),v=p(),g(o,"class","svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8"),g(t,"class","svelte-hrypa8")},m(e,l){s(e,t,l),i(t,n),i(n,o),i(o,r),i(n,a),i(n,c),i(c,u),i(t,v)},p(e,t){4&t&&h!==(h=e[10]+"")&&m(r,h),4&t&&w!==(w=JSON.stringify(e[11],null,4)+"")&&m(u,w)},d(e){e&&l(t)}}}function at(t){let n,r,a,h,m,w,y,b,_,S,C,k,O,x,P,j,M,$,E,F,N,A,T,I,D,J,R,U,H;function L(e,t){return e[1].tcfv2?tt:e[1].ccpa?et:e[1].aus?Ze:Xe}let B=L(t),W=B(t),G=t[2],V=[];for(let e=0;e<G.length;e+=1)V[e]=rt(Ye(t,G,e));return{c(){n=d("main"),r=d("nav"),a=d("button"),a.textContent="open privacy manager",h=p(),m=d("button"),m.textContent="clear preferences",w=p(),y=d("label"),b=d("input"),_=f("\n\t\t\tin RoW:"),S=d("strong"),S.textContent="TCFv2",k=p(),O=d("label"),x=d("input"),P=f("\n\t\t\tin USA:\n\t\t\t"),j=d("strong"),j.textContent="CCPA",$=p(),E=d("label"),F=d("input"),N=f("\n\t\t\tin Australia:\n\t\t\t"),A=d("strong"),A.textContent="CCPA-like",I=p(),D=d("div"),W.c(),J=p(),R=d("ol");for(let e=0;e<V.length;e+=1)V[e].c();g(a,"data-cy","pm"),g(a,"class","svelte-hrypa8"),g(m,"class","svelte-hrypa8"),g(b,"type","radio"),b.__value="tcfv2",b.value=b.__value,g(b,"class","svelte-hrypa8"),t[6][0].push(b),g(S,"class","svelte-hrypa8"),g(y,"class",C=c("tcfv2"==t[0]?"selected":"none")+" svelte-hrypa8"),g(x,"type","radio"),x.__value="ccpa",x.value=x.__value,g(x,"class","svelte-hrypa8"),t[6][0].push(x),g(j,"class","svelte-hrypa8"),g(O,"class",M=c("ccpa"==t[0]?"selected":"none")+" svelte-hrypa8"),g(F,"type","radio"),F.__value="aus",F.value=F.__value,g(F,"class","svelte-hrypa8"),t[6][0].push(F),g(A,"class","svelte-hrypa8"),g(E,"class",T=c("aus"==t[0]?"selected":"none")+" svelte-hrypa8"),g(r,"class","svelte-hrypa8"),g(D,"id","consent-state"),g(D,"class","svelte-hrypa8"),g(R,"id","events"),g(R,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8")},m(e,o){s(e,n,o),i(n,r),i(r,a),i(r,h),i(r,m),i(r,w),i(r,y),i(y,b),b.checked=b.__value===t[0],i(y,_),i(y,S),i(r,k),i(r,O),i(O,x),x.checked=x.__value===t[0],i(O,P),i(O,j),i(r,$),i(r,E),i(E,F),F.checked=F.__value===t[0],i(E,N),i(E,A),i(n,I),i(n,D),W.m(D,null),i(n,J),i(n,R);for(let e=0;e<V.length;e+=1)V[e].m(R,null);U||(H=[v(a,"click",qe.showPrivacyManager),v(m,"click",t[3]),v(b,"change",t[5]),v(b,"change",t[4]),v(x,"change",t[7]),v(x,"change",t[4]),v(F,"change",t[8]),v(F,"change",t[4])],U=!0)},p(e,[t]){if(1&t&&(b.checked=b.__value===e[0]),1&t&&C!==(C=c("tcfv2"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(y,"class",C),1&t&&(x.checked=x.__value===e[0]),1&t&&M!==(M=c("ccpa"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(O,"class",M),1&t&&(F.checked=F.__value===e[0]),1&t&&T!==(T=c("aus"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(E,"class",T),B===(B=L(e))&&W?W.p(e,t):(W.d(1),W=B(e),W&&(W.c(),W.m(D,null))),4&t){let n;for(G=e[2],n=0;n<G.length;n+=1){const o=Ye(e,G,n);V[n]?V[n].p(o,t):(V[n]=rt(o),V[n].c(),V[n].m(R,null))}for(;n<V.length;n+=1)V[n].d(1);V.length=G.length}},i:e,o:e,d(e){e&&l(n),t[6][0].splice(t[6][0].indexOf(b),1),t[6][0].splice(t[6][0].indexOf(x),1),t[6][0].splice(t[6][0].indexOf(F),1),W.d(),u(V,e),U=!1,o(H)}}}function ct(e,t,n){let o,r;switch(window.location.hash){case"#tcfv2":localStorage.setItem("framework",JSON.stringify("tcfv2"));break;case"#ccpa":localStorage.setItem("framework",JSON.stringify("ccpa"));break;case"#aus":localStorage.setItem("framework",JSON.stringify("aus"));break;default:window.location.hash="tcfv2",localStorage.setItem("framework",JSON.stringify("tcfv2"))}function a(e){n(2,r=[...r,e]),ce("cmp",e)}window.guardian.logger.subscribeTo("cmp"),window.guCmpHotFix=new Proxy(window.guCmpHotFix,{set:(e,t,n)=>(e[t]=n,console.info("%cwindow.guCmpHotFix","color: deeppink;",{...window.guCmpHotFix}),!0)});let c=()=>{localStorage.clear(),document.cookie.split(";").forEach((e=>{document.cookie=e.replace(/^ +/,"").replace(/=.*/,`=;expires=${(new Date).toUTCString()};path=/`)})),window.location.reload()},i=JSON.parse(localStorage.getItem("framework"));qe.willShowPrivacyMessage().then((e=>{a({title:"cmp.willShowPrivacyMessage",payload:e})})),ze((e=>{a({title:"onConsentChange",payload:e}),n(1,o=e)})),b((async()=>{let e="";switch(i){case"tcfv2":e="GB";break;case"ccpa":e="US";break;case"aus":e="AU"}qe.init({country:e}),qe.init({country:e}),qe.init({country:e}),qe.init({country:e})}));return n(1,o={}),n(2,r=[]),[i,o,r,c,()=>{localStorage.setItem("framework",JSON.stringify(i)),window.location.hash=i,c()},function(){i=this.__value,n(0,i)},[[]],function(){i=this.__value,n(0,i)},function(){i=this.__value,n(0,i)}]}ue||(De=window.guCmpHotFix).getConsentFor||(De.getConsentFor=(e,t)=>{var n,o=Be[e];if(void 0===o||o===[])throw new Error("Vendor '".concat(e,"' not found, or with no Sourcepoint ID. ")+"If it should be added, raise an issue at https://github.com/guardian/consent-management-platform/issues");if(t.ccpa)return!t.ccpa.doNotSell;if(t.aus)return t.aus.personalisedAdvertising;var r=o.find((e=>{var n;return void 0!==(null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[e])}));if(void 0===r)return console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1;var a=null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[r];return void 0===a?(console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1):a});var it=new class extends class{$destroy(){var t,n;t=1,null!==(n=this.$$).fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[]),this.$destroy=e}$on(t,n){if(!r(n))return e;var o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{var e=o.indexOf(n);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(t){super(),function(t,r,a,c,i,s,u){var d=arguments.length>7&&void 0!==arguments[7]?arguments[7]:[-1],f=w;y(t);var p=t.$$={fragment:null,ctx:[],props:s,update:e,not_equal:i,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(f?f.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:r.target||f.$$.root};u&&u(p.root);var v=!1;if(p.ctx=a?a(t,r.props||{},(function(e,n){var o=!(arguments.length<=2)&&arguments.length-2?arguments.length<=2?void 0:arguments[2]:n;return p.ctx&&i(p.ctx[e],p.ctx[e]=o)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](o),v&&T(t,e)),n})):[],p.update(),v=!0,o(p.before_update),p.fragment=!!c&&c(p.ctx),r.target){if(r.hydrate){var g=h(r.target);p.fragment&&p.fragment.l(g),g.forEach(l)}else p.fragment&&p.fragment.c();r.intro&&N(t.$$.fragment),A(t,r.target,r.anchor,r.customElement),$()}y(f)}(this,t,ct,at,a,{})}}({target:document.body});export{it as default};
//# sourceMappingURL=index.js.map
