function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function o(e){return"function"==typeof e}function a(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(e){return null==e?"":e}function i(e,t){e.appendChild(t)}function s(e,t,n){e.insertBefore(t,n||null)}function l(e){e.parentNode.removeChild(e)}function u(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function d(e){return document.createElement(e)}function f(e){return document.createTextNode(e)}function p(){return f(" ")}function v(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function g(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function h(e){return Array.from(e.childNodes)}function m(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}var y;function w(e){y=e}function b(e){(function(){if(!y)throw new Error("Function called outside component initialization");return y})().$$.on_mount.push(e)}var _=[],S=[],C=[],k=[],O=Promise.resolve(),x=!1;function P(e){C.push(e)}var j=new Set,M=0;function $(){var e=y;do{for(;M<_.length;){var t=_[M];M++,w(t),E(t.$$)}for(w(null),_.length=0,M=0;S.length;)S.pop()();for(var n=0;n<C.length;n+=1){var r=C[n];j.has(r)||(j.add(r),r())}C.length=0}while(_.length);for(;k.length;)k.pop()();x=!1,j.clear(),w(e)}function E(e){if(null!==e.fragment){e.update(),r(e.before_update);var t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(P)}}var F=new Set;function A(e,t){e&&e.i&&(F.delete(e),e.i(t))}function N(e,n,a,c){var{fragment:i,after_update:s}=e.$$;i&&i.m(n,a),c||P((()=>{var n=e.$$.on_mount.map(t).filter(o);e.$$.on_destroy?e.$$.on_destroy.push(...n):r(n),e.$$.on_mount=[]})),s.forEach(P)}function T(e,t){-1===e.$$.dirty[0]&&(_.push(e),x||(x=!0,O.then($)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}class I{$destroy(){var t,n;t=1,null!==(n=this.$$).fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[]),this.$destroy=e}$on(t,n){if(!o(n))return e;var r=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return r.push(n),()=>{var e=r.indexOf(n);-1!==e&&r.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function J(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?D(Object(n),!0).forEach((function(t){H(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function R(e,t,n,r,o,a,c){try{var i=e[a](c),s=i.value}catch(e){return void n(e)}i.done?t(s):Promise.resolve(s).then(r,o)}function U(e){return function(){var t=this,n=arguments;return new Promise((function(r,o){var a=e.apply(t,n);function c(e){R(a,r,o,c,i,"next",e)}function i(e){R(a,r,o,c,i,"throw",e)}c(void 0)}))}}function H(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function L(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}(e,W(e,t,"get"))}function B(e,t,n){return function(e,t,n){if(t.set)t.set.call(e,n);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=n}}(e,W(e,t,"set"),n),n}function W(e,t,n){if(!t.has(e))throw new TypeError("attempted to "+n+" private field on non-instance");return t.get(e)}var V,q,G=e=>"[object String]"===Object.prototype.toString.call(e),z=new WeakMap;class Y{constructor(e){z.set(this,{writable:!0,value:void 0});try{var t=window[e],n=(new Date).toString();t.setItem(n,n);var r=t.getItem(n)==n;t.removeItem(n),r&&B(this,z,t)}catch(e){}}isAvailable(){return Boolean(L(this,z))}get(e){try{var t,n,r=JSON.parse(null!==(t=null===(n=L(this,z))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:"");if(!(e=>{if("[object Object]"!==Object.prototype.toString.call(e))return!1;var t=Object.getPrototypeOf(e);return null===t||t===Object.prototype})(r))return null;var{value:o,expires:a}=r;return G(a)&&new Date>new Date(a)?(this.remove(e),null):o}catch(e){return null}}set(e,t,n){var r;return null===(r=L(this,z))||void 0===r?void 0:r.setItem(e,JSON.stringify({value:t,expires:n}))}remove(e){var t;return null===(t=L(this,z))||void 0===t?void 0:t.removeItem(e)}clear(){var e;return null===(e=L(this,z))||void 0===e?void 0:e.clear()}getRaw(e){var t,n;return null!==(t=null===(n=L(this,z))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:null}setRaw(e,t){var n;return null===(n=L(this,z))||void 0===n?void 0:n.setItem(e,t)}}var K,Q,X=new(V=new WeakMap,q=new WeakMap,class{constructor(){V.set(this,{writable:!0,value:void 0}),q.set(this,{writable:!0,value:void 0})}get local(){return L(this,V)||B(this,V,new Y("localStorage"))}get session(){return L(this,q)||B(this,q,new Y("sessionStorage"))}}),Z="gu.logger",ee={commercial:{background:"#77EEAA",font:"#004400"},cmp:{background:"#FF6BB5",font:"#2F0404"},dotcom:{background:"#000000",font:"#ff7300"},design:{background:"#185E36",font:"#FFF4F2"},tx:{background:"#2F4F4F",font:"#FFFFFF"},supporterRevenue:{background:"#0F70B7",font:"#ffffff"},identity:{background:"#6F5F8F",font:"#ffffff"}},te=e=>Object.keys(ee).includes(e),ne=J(J({},ee),{common:{background:"#052962",font:"#ffffff"}}),re=e=>{var{background:t,font:n}=ne[e];return"background: ".concat(t,"; color: ").concat(n,"; padding: 2px 3px; border-radius:3px")},oe=()=>{var e=X.local.get(Z);return G(e)?e.split(",").filter(te):[]};"undefined"!=typeof window&&((K=window).guardian||(K.guardian={}),(Q=window.guardian).logger||(Q.logger={subscribeTo:e=>{var t=oe();t.includes(e)||t.push(e),X.local.set(Z,t.join(",")),se(e,"🔔 Subscribed, hello!")},unsubscribeFrom:e=>{se(e,"🔕 Unsubscribed, good-bye!");var t=oe().filter((t=>t!==e));X.local.set(Z,t.join(","))},teams:()=>Object.keys(ee)}));var ae,ce,ie,se=function(e){if(oe().includes(e)){for(var t=[re("common"),"",re(e),""],n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];console.log("%c@guardian%c %c".concat(e,"%c"),...t,...r)}},le=e=>{se("cmp","Framework set to ".concat(e)),ae=e},ue=()=>ae,de=e=>{var t,n;null===(t=window.performance)||void 0===t||null===(n=t.mark)||void 0===n||n.call(t,e),se("cmp","[event]",e)},fe="undefined"==typeof window,pe=()=>{console.warn("This is a server-side version of the @guardian/consent-management-platform","No consent signals will be received.")},ve=e=>()=>(pe(),e),ge={__disable:pe,__enable:ve(!1),__isDisabled:ve(!1),hasInitialised:ve(!1),init:pe,showPrivacyManager:pe,version:"n/a",willShowPrivacyMessage:ve(Promise.resolve(!1)),willShowPrivacyMessageSync:ve(!1)},he=()=>(void 0===ce&&(ce=!!fe||window.location.host.endsWith(".theguardian.com")),ce),me=he()?"https://sourcepoint.theguardian.com":"https://cdn.privacy-mgmt.com",ye=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((r,o)=>o?t(r):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},we=function(){var e=U((function*(){return{personalisedAdvertising:!("Y"===(yield ye()).uspString.charAt(2))}}));return function(){return e.apply(this,arguments)}}(),be=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((r,o)=>o?t(r):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},_e=function(){var e=U((function*(){return{doNotSell:"Y"===(yield be()).uspString.charAt(2)}}));return function(){return e.apply(this,arguments)}}(),Se=e=>new Promise(((t,n)=>{window.__tcfapi?window.__tcfapi(e,2,((r,o)=>o?t(r):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __tcfapi found on window"))})),Ce={1:!1,2:!1,3:!1,4:!1,5:!1,6:!1,7:!1,8:!1,9:!1,10:!1},ke=function(){var e=U((function*(){var[e,t]=yield Promise.all([Se("getTCData"),Se("getCustomVendorConsents")]);if(void 0===e){var n,r=null!==(n=ue())&&void 0!==n?n:"undefined";throw new Error("No TC Data found with current framework: ".concat(r))}var o=J(J({},Ce),e.purpose.consents),{eventStatus:a,gdprApplies:c,tcString:i,addtlConsent:s}=e,{grants:l}=t;return{consents:o,eventStatus:a,vendorConsents:Object.keys(l).sort().reduce(((e,t)=>J(J({},e),{},{[t]:l[t].vendorGrant})),{}),addtlConsent:s,gdprApplies:c,tcString:i}}));return function(){return e.apply(this,arguments)}}(),Oe=[],xe=e=>{var t;return"cmpuishown"===(null===(t=e.tcfv2)||void 0===t?void 0:t.eventStatus)},Pe=(e,t)=>{if(!xe(t)){var n=JSON.stringify(t);n!==e.lastState&&(e.fn(t),e.lastState=n)}},je=e=>{var t=fe?void 0:navigator.globalPrivacyControl;if(e.tcfv2){var n=e.tcfv2.consents;return J(J({},e),{},{canTarget:Object.keys(n).length>0&&Object.values(n).every(Boolean),framework:"tcfv2",gpcSignal:t})}return e.ccpa?J(J({},e),{},{canTarget:!e.ccpa.doNotSell,framework:"ccpa",gpcSignal:t}):e.aus?J(J({},e),{},{canTarget:e.aus.personalisedAdvertising,framework:"aus",gpcSignal:t}):J(J({},e),{},{canTarget:!1,framework:null,gpcSignal:t})},Me=function(){var e=U((function*(){switch(ue()){case"aus":return je({aus:yield we()});case"ccpa":return je({ccpa:yield _e()});case"tcfv2":return je({tcfv2:yield ke()});default:throw new Error("no IAB consent framework found on the page")}}));return function(){return e.apply(this,arguments)}}(),$e=()=>{0!==Oe.length&&Me().then((e=>{xe(e)||Oe.forEach((t=>Pe(t,e)))}))},Ee=e=>{var t={fn:e};Oe.push(t),Me().then((e=>{Pe(t,e)})).catch((()=>{}))},Fe=()=>{!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){var r=n(2);e.exports=!r((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t,n){n(4),function(){if("function"!=typeof window.__tcfapi){var e,t=[],n=window,r=n.document;!n.__tcfapi&&function e(){var t=!!n.frames.__tcfapiLocator;if(!t)if(r.body){var o=r.createElement("iframe");o.style.cssText="display:none",o.name="__tcfapiLocator",r.body.appendChild(o)}else setTimeout(e,5);return!t}()&&(n.__tcfapi=function(){for(var n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];if(!r.length)return t;if("setGdprApplies"===r[0])r.length>3&&2===parseInt(r[1],10)&&"boolean"==typeof r[3]&&(e=r[3],"function"==typeof r[2]&&r[2]("set",!0));else if("ping"===r[0]){var a={gdprApplies:e,cmpLoaded:!1,apiVersion:"2.0"};"function"==typeof r[2]&&r[2](a,!0)}else t.push(r)},n.addEventListener("message",(function(e){var t="string"==typeof e.data,r={};try{r=t?JSON.parse(e.data):e.data}catch(e){}var o=r.__tcfapiCall;o&&n.__tcfapi(o.command,o.version,(function(n,r){var a={__tcfapiReturn:{returnValue:n,success:r,callId:o.callId}};t&&(a=JSON.stringify(a)),e.source.postMessage(a,"*")}),o.parameter)}),!1))}}()},function(e,t,n){var r=n(0),o=n(5).f,a=Function.prototype,c=a.toString,i=/^s*function ([^ (]*)/;r&&!("name"in a)&&o(a,"name",{configurable:!0,get:function(){try{return c.call(this).match(i)[1]}catch(e){return""}}})},function(e,t,n){var r=n(0),o=n(6),a=n(10),c=n(11),i=Object.defineProperty;t.f=r?i:function(e,t,n){if(a(e),t=c(t,!0),a(n),o)try{return i(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(e[t]=n.value),e}},function(e,t,n){var r=n(0),o=n(2),a=n(7);e.exports=!r&&!o((function(){return 7!=Object.defineProperty(a("div"),"a",{get:function(){return 7}}).a}))},function(e,t,n){var r=n(8),o=n(1),a=r.document,c=o(a)&&o(a.createElement);e.exports=function(e){return c?a.createElement(e):{}}},function(e,t,n){(function(t){var n=function(e){return e&&e.Math==Math&&e};e.exports=n("object"==typeof globalThis&&globalThis)||n("object"==typeof window&&window)||n("object"==typeof self&&self)||n("object"==typeof t&&t)||Function("return this")()}).call(this,n(9))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){var r=n(1);e.exports=function(e){if(!r(e))throw TypeError(String(e)+" is not an object");return e}},function(e,t,n){var r=n(1);e.exports=function(e,t){if(!r(e))return e;var n,o;if(t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;if("function"==typeof(n=e.valueOf)&&!r(o=n.call(e)))return o;if(!t&&"function"==typeof(n=e.toString)&&!r(o=n.call(e)))return o;throw TypeError("Can't convert object to primitive value")}}])},Ae=e=>{"tcfv2"===e?Fe():function(){var e=window,t=document;function n(t){var n="string"==typeof t.data;try{var r=n?JSON.parse(t.data):t.data;if(r.__cmpCall){var o=r.__cmpCall;e.__uspapi(o.command,o.parameter,(function(e,r){var a={__cmpReturn:{returnValue:e,success:r,callId:o.callId}};t.source.postMessage(n?JSON.stringify(a):a,"*")}))}}catch(r){}}!function n(){if(!e.frames.__uspapiLocator)if(t.body){var r=t.body,o=t.createElement("iframe");o.style.cssText="display:none",o.name="__uspapiLocator",r.appendChild(o)}else setTimeout(n,5)}(),"function"!=typeof __uspapi&&(e.__uspapi=function(){var e=arguments;if(__uspapi.a=__uspapi.a||[],!e.length)return __uspapi.a;"ping"===e[0]?e[2]({gdprAppliesGlobally:!1,cmpLoaded:!1},!0):__uspapi.a.push([].slice.apply(e))},__uspapi.msgHandler=n,e.addEventListener("message",n,!1))}()},Ne=new Promise((e=>{ie=e})),Te=e=>"aus"==e?"https://au.theguardian.com":he()?null:"https://test.theguardian.com";var Ie,De,Je,Re,Ue,He=(e,t)=>{de("cmp-init"),function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(Ae(e),window._sp_)throw new Error("Sourcepoint global (window._sp_) is already defined!");le(e),$e();var n="tcfv2"==e?"gdpr":"ccpa";se("cmp","framework: ".concat(e)),se("cmp","frameworkMessageType: ".concat(n)),window._sp_queue=[],window._sp_={config:{baseEndpoint:me,accountId:1257,propertyHref:Te(e),targetingParams:{framework:e},pubData:J(J({},t),{},{cmpInitTimeUtc:(new Date).getTime()}),events:{onConsentReady:(e,t,r)=>{se("cmp","onConsentReady ".concat(e)),e==n&&(se("cmp","consentUUID ".concat(t)),se("cmp","euconsent ".concat(r)),de("cmp-got-consent"),setTimeout($e,0))},onMessageReady:e=>{se("cmp","onMessageReady ".concat(e)),e==n&&de("cmp-ui-displayed")},onMessageReceiveData:(e,t)=>{se("cmp","onMessageReceiveData ".concat(e)),e==n&&(se("cmp","onMessageReceiveData ",t),ie(0!==t.messageId))},onMessageChoiceSelect:(e,t,r)=>{se("cmp","onMessageChoiceSelect message_type: ".concat(e)),console.log(),e==n&&(se("cmp","onMessageChoiceSelect choice_id: ".concat(t)),se("cmp","onMessageChoiceSelect choice_type_id: ".concat(r)),11!==r&&13!==r&&15!==r||setTimeout($e,0))},onPrivacyManagerAction:function(e,t){se("cmp","onPrivacyManagerAction message_type: ".concat(e)),e==n&&se("cmp","onPrivacyManagerAction ".concat(t))},onMessageChoiceError:function(e,t){se("cmp","onMessageChoiceError ".concat(e)),e==n&&se("cmp","onMessageChoiceError ".concat(t))},onPMCancel:function(e){se("cmp","onPMCancel ".concat(e))},onSPPMObjectReady:function(){se("cmp","onSPPMObjectReady")},onError:function(e,t,r,o){se("cmp","errorCode: ".concat(e)),e==n&&(se("cmp","errorCode: ".concat(t)),se("cmp",r),se("cmp","userReset: ".concat(o)))}}}},"tcfv2"===e?window._sp_.config.gdpr={targetingParams:{framework:e}}:window._sp_.config.ccpa={targetingParams:{framework:e}};var r=document.createElement("script");r.id="sourcepoint-lib",r.src="".concat(me,"/unified/wrapperMessagingWithoutDetection.js"),document.body.appendChild(r)}(e,t)},Le=()=>Ne,Be=function(){var e,t,n,r,o,a,c,i,s;switch(ue()){case"tcfv2":null===(e=window._sp_)||void 0===e||null===(t=e.gdpr)||void 0===t||null===(n=t.loadPrivacyManagerModal)||void 0===n||n.call(t,106842);break;case"ccpa":null===(r=window._sp_)||void 0===r||null===(o=r.ccpa)||void 0===o||null===(a=o.loadPrivacyManagerModal)||void 0===a||a.call(o,540252);break;case"aus":null===(c=window._sp_)||void 0===c||null===(i=c.ccpa)||void 0===i||null===(s=i.loadPrivacyManagerModal)||void 0===s||s.call(i,540341)}},We="gu-cmp-disabled",Ve=()=>new RegExp("".concat(We,"=true(\\W+|$)")).test(document.cookie),qe={a9:["5f369a02b8e05c308701f829"],acast:["5f203dcb1f0dea790562e20f"],braze:["5ed8c49c4b8ce4571c7ad801"],comscore:["5efefe25b8e05c06542b2a77"],fb:["5e7e1298b8e05c54a85c52d2"],"google-analytics":["5e542b3a4cd8884eb41b5a72"],"google-mobile-ads":["5f1aada6b8e05c306c0597d7"],"google-tag-manager":["5e952f6107d9d20c88e7c975"],googletag:["5f1aada6b8e05c306c0597d7"],ias:["5e7ced57b8e05c485246ccf3"],inizio:["5e37fc3e56a5e6615502f9c9"],ipsos:["5fa51b29a228638b4a1980e4"],linkedin:["5f2d22a6b8e05c02aa283b3c"],lotame:["5ed6aeb1b8e05c241a63c71f"],nielsen:["5ef5c3a5b8e05c69980eaa5b"],ophan:["5f203dbeeaaaa8768fd3226a"],permutive:["5eff0d77969bfa03746427eb"],prebid:["5f92a62aa22863685f4daa4c"],qm:["5f295fa4b8e05c76a44c3149"],redplanet:["5f199c302425a33f3f090f51"],remarketing:["5ed0eb688a76503f1016578f"],sentry:["5f0f39014effda6e8bbd2006"],teads:["5eab3d5ab8e05c2bbe33f399"],twitter:["5e71760b69966540e4554f01"],"youtube-player":["5e7ac3fae30e7d1bc1ebf5e8"]};fe||window.guCmpHotFix||(window.guCmpHotFix={});var Ge,ze=!1,Ye=new Promise((e=>{Ge=e})),Ke=fe?ge:(Ie=window.guCmpHotFix).cmp||(Ie.cmp={init:e=>{var{pubData:t,country:n}=e;if(!Ve()&&!fe)if(window.guCmpHotFix.initialised){var r,o;"0.0.0-this-never-updates-in-source-code-refer-to-git-tags"!==(null===(r=window.guCmpHotFix.cmp)||void 0===r?void 0:r.version)&&console.warn("Two different versions of the CMP are running:",["0.0.0-this-never-updates-in-source-code-refer-to-git-tags",null===(o=window.guCmpHotFix.cmp)||void 0===o?void 0:o.version])}else{if(window.guCmpHotFix.initialised=!0,void 0===n)throw new Error("CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.");var a=(e=>{var t;switch(e){case"US":t="ccpa";break;case"AU":t="aus";break;default:t="tcfv2"}return t})(n);He(a,null!=t?t:{}),Le().then((e=>{Ue=e,ze=!0,se("cmp","initComplete")})),Ge()}},willShowPrivacyMessage:()=>Ye.then((()=>Le())),willShowPrivacyMessageSync:()=>{if(void 0!==Ue)return Ue;throw new Error("CMP has not been initialised. Use the async willShowPrivacyMessage() instead.")},hasInitialised:()=>ze,showPrivacyManager:()=>{Ye.then(Be)},version:"0.0.0-this-never-updates-in-source-code-refer-to-git-tags",__isDisabled:Ve,__enable:()=>{document.cookie="".concat(We,"=false")},__disable:()=>{document.cookie="".concat(We,"=true")}});fe||(De=window.guCmpHotFix).onConsent||(De.onConsent=()=>new Promise(((e,t)=>{Ee((n=>{(n.tcfv2||n.ccpa||n.aus)&&e(n),t("Unknown framework")}))})));var Qe=fe?()=>pe():(Je=window.guCmpHotFix).onConsentChange||(Je.onConsentChange=Ee);function Xe(e,t,n){const r=e.slice();return r[10]=t[n].title,r[11]=t[n].payload,r}function Ze(e,t,n){const r=e.slice();return r[14]=t[n][0],r[15]=t[n][1],r}function et(e,t,n){const r=e.slice();return r[18]=t[n][0],r[15]=t[n][1],r}function tt(t){let n;return{c(){n=d("h2"),n.textContent="¯\\_(ツ)_/¯",g(n,"class","svelte-hrypa8")},m(e,t){s(e,n,t)},p:e,d(e){e&&l(n)}}}function nt(e){let t,n,r,o,a,u,v=e[1].aus.personalisedAdvertising+"";return{c(){t=d("h2"),t.textContent="aus.personalisedAdvertising",n=p(),r=d("span"),o=f(v),g(t,"class","svelte-hrypa8"),g(r,"data-personalised-advertising",a=e[1].aus.personalisedAdvertising),g(r,"class",u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")},m(e,a){s(e,t,a),s(e,n,a),s(e,r,a),i(r,o)},p(e,t){2&t&&v!==(v=e[1].aus.personalisedAdvertising+"")&&m(o,v),2&t&&a!==(a=e[1].aus.personalisedAdvertising)&&g(r,"data-personalised-advertising",a),2&t&&u!==(u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")&&g(r,"class",u)},d(e){e&&l(t),e&&l(n),e&&l(r)}}}function rt(e){let t,n,r,o,a,c=e[1].ccpa.doNotSell+"";return{c(){t=d("h2"),t.textContent="ccpa.doNotSell",n=p(),r=d("span"),o=f(c),g(t,"class","svelte-hrypa8"),g(r,"class","label svelte-hrypa8"),g(r,"data-donotsell",a=e[1].ccpa.doNotSell)},m(e,a){s(e,t,a),s(e,n,a),s(e,r,a),i(r,o)},p(e,t){2&t&&c!==(c=e[1].ccpa.doNotSell+"")&&m(o,c),2&t&&a!==(a=e[1].ccpa.doNotSell)&&g(r,"data-donotsell",a)},d(e){e&&l(t),e&&l(n),e&&l(r)}}}function ot(e){let t,n,r,o,a,c,v,h,y,w,b,_=e[1].tcfv2.eventStatus+"",S=Object.entries(e[1].tcfv2.consents),C=[];for(let t=0;t<S.length;t+=1)C[t]=at(et(e,S,t));let k=Object.entries(e[1].tcfv2.vendorConsents),O=[];for(let t=0;t<k.length;t+=1)O[t]=ct(Ze(e,k,t));return{c(){t=d("h2"),t.textContent="tcfv2.eventStatus",n=p(),r=d("span"),o=f(_),a=p(),c=d("h2"),c.textContent="tcfv2.consents",v=p();for(let e=0;e<C.length;e+=1)C[e].c();h=p(),y=d("h2"),y.textContent="tcfv2.vendorConsents",w=p();for(let e=0;e<O.length;e+=1)O[e].c();b=f(""),g(t,"class","svelte-hrypa8"),g(r,"class","label svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(y,"class","svelte-hrypa8")},m(e,l){s(e,t,l),s(e,n,l),s(e,r,l),i(r,o),s(e,a,l),s(e,c,l),s(e,v,l);for(let t=0;t<C.length;t+=1)C[t].m(e,l);s(e,h,l),s(e,y,l),s(e,w,l);for(let t=0;t<O.length;t+=1)O[t].m(e,l);s(e,b,l)},p(e,t){if(2&t&&_!==(_=e[1].tcfv2.eventStatus+"")&&m(o,_),2&t){let n;for(S=Object.entries(e[1].tcfv2.consents),n=0;n<S.length;n+=1){const r=et(e,S,n);C[n]?C[n].p(r,t):(C[n]=at(r),C[n].c(),C[n].m(h.parentNode,h))}for(;n<C.length;n+=1)C[n].d(1);C.length=S.length}if(2&t){let n;for(k=Object.entries(e[1].tcfv2.vendorConsents),n=0;n<k.length;n+=1){const r=Ze(e,k,n);O[n]?O[n].p(r,t):(O[n]=ct(r),O[n].c(),O[n].m(b.parentNode,b))}for(;n<O.length;n+=1)O[n].d(1);O.length=k.length}},d(e){e&&l(t),e&&l(n),e&&l(r),e&&l(a),e&&l(c),e&&l(v),u(C,e),e&&l(h),e&&l(y),e&&l(w),u(O,e),e&&l(b)}}}function at(e){let t,n,r,o,a,u=e[18]+"";return{c(){t=d("span"),n=f(u),g(t,"class",r=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8"),g(t,"data-purpose",o=e[18]),g(t,"data-consent",a=e[15])},m(e,r){s(e,t,r),i(t,n)},p(e,i){2&i&&u!==(u=e[18]+"")&&m(n,u),2&i&&r!==(r=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",r),2&i&&o!==(o=e[18])&&g(t,"data-purpose",o),2&i&&a!==(a=e[15])&&g(t,"data-consent",a)},d(e){e&&l(t)}}}function ct(e){let t,n,r,o=e[14]+"";return{c(){t=d("span"),n=f(o),g(t,"class",r=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")},m(e,r){s(e,t,r),i(t,n)},p(e,a){2&a&&o!==(o=e[14]+"")&&m(n,o),2&a&&r!==(r=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",r)},d(e){e&&l(t)}}}function it(e){let t,n,r,o,a,c,u,v,h=e[10]+"",y=JSON.stringify(e[11],null,4)+"";return{c(){t=d("li"),n=d("details"),r=d("summary"),o=f(h),a=p(),c=d("pre"),u=f(y),v=p(),g(r,"class","svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8"),g(t,"class","svelte-hrypa8")},m(e,l){s(e,t,l),i(t,n),i(n,r),i(r,o),i(n,a),i(n,c),i(c,u),i(t,v)},p(e,t){4&t&&h!==(h=e[10]+"")&&m(o,h),4&t&&y!==(y=JSON.stringify(e[11],null,4)+"")&&m(u,y)},d(e){e&&l(t)}}}function st(t){let n,o,a,h,m,y,w,b,_,S,C,k,O,x,P,j,M,$,E,F,A,N,T,I,D,J,R,U,H;function L(e,t){return e[1].tcfv2?ot:e[1].ccpa?rt:e[1].aus?nt:tt}let B=L(t),W=B(t),V=t[2],q=[];for(let e=0;e<V.length;e+=1)q[e]=it(Xe(t,V,e));return{c(){n=d("main"),o=d("nav"),a=d("button"),a.textContent="open privacy manager",h=p(),m=d("button"),m.textContent="clear preferences",y=p(),w=d("label"),b=d("input"),_=f("\n\t\t\tin RoW:"),S=d("strong"),S.textContent="TCFv2",k=p(),O=d("label"),x=d("input"),P=f("\n\t\t\tin USA:\n\t\t\t"),j=d("strong"),j.textContent="CCPA",$=p(),E=d("label"),F=d("input"),A=f("\n\t\t\tin Australia:\n\t\t\t"),N=d("strong"),N.textContent="CCPA-like",I=p(),D=d("div"),W.c(),J=p(),R=d("ol");for(let e=0;e<q.length;e+=1)q[e].c();g(a,"data-cy","pm"),g(a,"class","svelte-hrypa8"),g(m,"class","svelte-hrypa8"),g(b,"type","radio"),b.__value="tcfv2",b.value=b.__value,g(b,"class","svelte-hrypa8"),t[6][0].push(b),g(S,"class","svelte-hrypa8"),g(w,"class",C=c("tcfv2"==t[0]?"selected":"none")+" svelte-hrypa8"),g(x,"type","radio"),x.__value="ccpa",x.value=x.__value,g(x,"class","svelte-hrypa8"),t[6][0].push(x),g(j,"class","svelte-hrypa8"),g(O,"class",M=c("ccpa"==t[0]?"selected":"none")+" svelte-hrypa8"),g(F,"type","radio"),F.__value="aus",F.value=F.__value,g(F,"class","svelte-hrypa8"),t[6][0].push(F),g(N,"class","svelte-hrypa8"),g(E,"class",T=c("aus"==t[0]?"selected":"none")+" svelte-hrypa8"),g(o,"class","svelte-hrypa8"),g(D,"id","consent-state"),g(D,"class","svelte-hrypa8"),g(R,"id","events"),g(R,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8")},m(e,r){s(e,n,r),i(n,o),i(o,a),i(o,h),i(o,m),i(o,y),i(o,w),i(w,b),b.checked=b.__value===t[0],i(w,_),i(w,S),i(o,k),i(o,O),i(O,x),x.checked=x.__value===t[0],i(O,P),i(O,j),i(o,$),i(o,E),i(E,F),F.checked=F.__value===t[0],i(E,A),i(E,N),i(n,I),i(n,D),W.m(D,null),i(n,J),i(n,R);for(let e=0;e<q.length;e+=1)q[e].m(R,null);U||(H=[v(a,"click",Ke.showPrivacyManager),v(m,"click",t[3]),v(b,"change",t[5]),v(b,"change",t[4]),v(x,"change",t[7]),v(x,"change",t[4]),v(F,"change",t[8]),v(F,"change",t[4])],U=!0)},p(e,[t]){if(1&t&&(b.checked=b.__value===e[0]),1&t&&C!==(C=c("tcfv2"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(w,"class",C),1&t&&(x.checked=x.__value===e[0]),1&t&&M!==(M=c("ccpa"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(O,"class",M),1&t&&(F.checked=F.__value===e[0]),1&t&&T!==(T=c("aus"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(E,"class",T),B===(B=L(e))&&W?W.p(e,t):(W.d(1),W=B(e),W&&(W.c(),W.m(D,null))),4&t){let n;for(V=e[2],n=0;n<V.length;n+=1){const r=Xe(e,V,n);q[n]?q[n].p(r,t):(q[n]=it(r),q[n].c(),q[n].m(R,null))}for(;n<q.length;n+=1)q[n].d(1);q.length=V.length}},i:e,o:e,d(e){e&&l(n),t[6][0].splice(t[6][0].indexOf(b),1),t[6][0].splice(t[6][0].indexOf(x),1),t[6][0].splice(t[6][0].indexOf(F),1),W.d(),u(q,e),U=!1,r(H)}}}function lt(e,t,n){let r,o;switch(window.location.hash){case"#tcfv2":localStorage.setItem("framework",JSON.stringify("tcfv2"));break;case"#ccpa":localStorage.setItem("framework",JSON.stringify("ccpa"));break;case"#aus":localStorage.setItem("framework",JSON.stringify("aus"));break;default:window.location.hash="tcfv2",localStorage.setItem("framework",JSON.stringify("tcfv2"))}function a(e){n(2,o=[...o,e]),se("cmp",e)}window.guardian.logger.subscribeTo("cmp"),window.guCmpHotFix=new Proxy(window.guCmpHotFix,{set:(e,t,n)=>(e[t]=n,console.info("%cwindow.guCmpHotFix","color: deeppink;",{...window.guCmpHotFix}),!0)});let c=()=>{localStorage.clear(),document.cookie.split(";").forEach((e=>{document.cookie=e.replace(/^ +/,"").replace(/=.*/,`=;expires=${(new Date).toUTCString()};path=/`)})),window.location.reload()},i=JSON.parse(localStorage.getItem("framework"));Ke.willShowPrivacyMessage().then((e=>{a({title:"cmp.willShowPrivacyMessage",payload:e})})),Qe((e=>{a({title:"onConsentChange",payload:e}),n(1,r=e)})),b((async()=>{let e="";switch(i){case"tcfv2":e="GB";break;case"ccpa":e="US";break;case"aus":e="AU"}Ke.init({country:e}),Ke.init({country:e}),Ke.init({country:e}),Ke.init({country:e})}));return n(1,r={}),n(2,o=[]),[i,r,o,c,()=>{localStorage.setItem("framework",JSON.stringify(i)),window.location.hash=i,c()},function(){i=this.__value,n(0,i)},[[]],function(){i=this.__value,n(0,i)},function(){i=this.__value,n(0,i)}]}fe||(Re=window.guCmpHotFix).getConsentFor||(Re.getConsentFor=(e,t)=>{var n,r=qe[e];if(void 0===r||Array.isArray(r)&&0===r.length)throw new Error("Vendor '".concat(e,"' not found, or with no Sourcepoint ID. ")+"If it should be added, raise an issue at https://github.com/guardian/consent-management-platform/issues");if(t.ccpa)return!t.ccpa.doNotSell;if(t.aus)return t.aus.personalisedAdvertising;var o=r.find((e=>{var n;return void 0!==(null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[e])}));if(void 0===o)return console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1;var a=null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[o];return void 0===a?(console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1):a});var ut=new class extends I{constructor(t){super(),function(t,o,a,c,i,s,u){var d=arguments.length>7&&void 0!==arguments[7]?arguments[7]:[-1],f=y;w(t);var p=t.$$={fragment:null,ctx:[],props:s,update:e,not_equal:i,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(f?f.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:o.target||f.$$.root};u&&u(p.root);var v=!1;if(p.ctx=a?a(t,o.props||{},(function(e,n){var r=!(arguments.length<=2)&&arguments.length-2?arguments.length<=2?void 0:arguments[2]:n;return p.ctx&&i(p.ctx[e],p.ctx[e]=r)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](r),v&&T(t,e)),n})):[],p.update(),v=!0,r(p.before_update),p.fragment=!!c&&c(p.ctx),o.target){if(o.hydrate){var g=h(o.target);p.fragment&&p.fragment.l(g),g.forEach(l)}else p.fragment&&p.fragment.c();o.intro&&A(t.$$.fragment),N(t,o.target,o.anchor,o.customElement),$()}w(f)}(this,t,lt,st,a,{})}}({target:document.body});export{ut as default};
//# sourceMappingURL=index.js.map
