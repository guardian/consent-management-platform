function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function r(e){return"function"==typeof e}function a(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function c(e){return null==e?"":e}function i(e,t){e.appendChild(t)}function s(e,t,n){e.insertBefore(t,n||null)}function l(e){e.parentNode.removeChild(e)}function u(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function d(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function f(){return p(" ")}function v(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function g(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function m(e){return Array.from(e.childNodes)}function h(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}var y;function w(e){y=e}function b(e){(function(){if(!y)throw new Error("Function called outside component initialization");return y})().$$.on_mount.push(e)}var _=[],S=[],C=[],k=[],O=Promise.resolve(),x=!1;function P(e){C.push(e)}var M=new Set,j=0;function E(){var e=y;do{for(;j<_.length;){var t=_[j];j++,w(t),$(t.$$)}for(w(null),_.length=0,j=0;S.length;)S.pop()();for(var n=0;n<C.length;n+=1){var o=C[n];M.has(o)||(M.add(o),o())}C.length=0}while(_.length);for(;k.length;)k.pop()();x=!1,M.clear(),w(e)}function $(e){if(null!==e.fragment){e.update(),o(e.before_update);var t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(P)}}var F=new Set;function A(e,t){e&&e.i&&(F.delete(e),e.i(t))}function N(e,n,a,c){var{fragment:i,after_update:s}=e.$$;i&&i.m(n,a),c||P((()=>{var n=e.$$.on_mount.map(t).filter(r);e.$$.on_destroy?e.$$.on_destroy.push(...n):o(n),e.$$.on_mount=[]})),s.forEach(P)}function I(e,t){-1===e.$$.dirty[0]&&(_.push(e),x||(x=!0,O.then(E)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}class T{$destroy(){var t,n;t=1,null!==(n=this.$$).fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[]),this.$destroy=e}$on(t,n){if(!r(n))return e;var o=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return o.push(n),()=>{var e=o.indexOf(n);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function J(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?D(Object(n),!0).forEach((function(t){R(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function U(e,t,n,o,r,a,c){try{var i=e[a](c),s=i.value}catch(e){return void n(e)}i.done?t(s):Promise.resolve(s).then(o,r)}function H(e){return function(){var t=this,n=arguments;return new Promise((function(o,r){var a=e.apply(t,n);function c(e){U(a,o,r,c,i,"next",e)}function i(e){U(a,o,r,c,i,"throw",e)}c(void 0)}))}}function R(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function L(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}(e,q(e,t,"get"))}function B(e,t,n){return function(e,t,n){if(t.set)t.set.call(e,n);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=n}}(e,q(e,t,"set"),n),n}function q(e,t,n){if(!t.has(e))throw new TypeError("attempted to "+n+" private field on non-instance");return t.get(e)}var W,G,V=e=>{var{name:t,currentDomainOnly:n=!1}=e,o="expires=Thu, 01 Jan 1970 00:00:01 GMT;",r="path=/;";document.cookie="".concat(t,"=;").concat(r).concat(o),n||(document.cookie="".concat(t,"=;").concat(r).concat(o," domain=").concat(function(){var e,t,n,{isCrossSubdomain:o=!1}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=document.domain||"";return"localhost"===r||null!==(e=window.guardian)&&void 0!==e&&null!==(t=e.config)&&void 0!==t&&null!==(n=t.page)&&void 0!==n&&n.isPreview?r:o?["",...r.split(".").slice(-2)].join("."):r.replace(/^(www|m\.code|dev|m)\./,".")}(),";"))},z=e=>"[object String]"===Object.prototype.toString.call(e),Q=new WeakMap;class Y{constructor(e){Q.set(this,{writable:!0,value:void 0});try{var t=window[e],n=(new Date).toString();t.setItem(n,n);var o=t.getItem(n)==n;t.removeItem(n),o&&B(this,Q,t)}catch(e){}}isAvailable(){return Boolean(L(this,Q))}get(e){try{var t,n,o=JSON.parse(null!==(t=null===(n=L(this,Q))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:"");if(!(e=>{if("[object Object]"!==Object.prototype.toString.call(e))return!1;var t=Object.getPrototypeOf(e);return null===t||t===Object.prototype})(o))return null;var{value:r,expires:a}=o;return z(a)&&new Date>new Date(a)?(this.remove(e),null):r}catch(e){return null}}set(e,t,n){var o;return null===(o=L(this,Q))||void 0===o?void 0:o.setItem(e,JSON.stringify({value:t,expires:n}))}remove(e){var t;return null===(t=L(this,Q))||void 0===t?void 0:t.removeItem(e)}clear(){var e;return null===(e=L(this,Q))||void 0===e?void 0:e.clear()}getRaw(e){var t,n;return null!==(t=null===(n=L(this,Q))||void 0===n?void 0:n.getItem(e))&&void 0!==t?t:null}setRaw(e,t){var n;return null===(n=L(this,Q))||void 0===n?void 0:n.setItem(e,t)}}var K,X,Z=new(W=new WeakMap,G=new WeakMap,class{constructor(){W.set(this,{writable:!0,value:void 0}),G.set(this,{writable:!0,value:void 0})}get local(){return L(this,W)||B(this,W,new Y("localStorage"))}get session(){return L(this,G)||B(this,G,new Y("sessionStorage"))}}),ee="gu.logger",te={commercial:{background:"#77EEAA",font:"#004400"},cmp:{background:"#FF6BB5",font:"#2F0404"},dotcom:{background:"#000000",font:"#ff7300"},design:{background:"#185E36",font:"#FFF4F2"},tx:{background:"#2F4F4F",font:"#FFFFFF"},supporterRevenue:{background:"#0F70B7",font:"#ffffff"},identity:{background:"#6F5F8F",font:"#ffffff"}},ne=e=>Object.keys(te).includes(e),oe=J(J({},te),{common:{background:"#052962",font:"#ffffff"}}),re=e=>{var{background:t,font:n}=oe[e];return"background: ".concat(t,"; color: ").concat(n,"; padding: 2px 3px; border-radius:3px")},ae=()=>{var e=Z.local.get(ee);return z(e)?e.split(",").filter(ne):[]};"undefined"!=typeof window&&((K=window).guardian||(K.guardian={}),(X=window.guardian).logger||(X.logger={subscribeTo:e=>{var t=ae();t.includes(e)||t.push(e),Z.local.set(ee,t.join(",")),le(e,"🔔 Subscribed, hello!")},unsubscribeFrom:e=>{le(e,"🔕 Unsubscribed, good-bye!");var t=ae().filter((t=>t!==e));Z.local.set(ee,t.join(","))},teams:()=>Object.keys(te)}));var ce,ie,se,le=function(e){if(ae().includes(e)){for(var t=[re("common"),"",re(e),""],n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];console.log("%c@guardian%c %c".concat(e,"%c"),...t,...o)}},ue=e=>{le("cmp","Framework set to ".concat(e)),ce=e},de=()=>ce,pe=e=>{var t,n;null===(t=window.performance)||void 0===t||null===(n=t.mark)||void 0===n||n.call(t,e),le("cmp","[event]",e)},fe="undefined"==typeof window,ve=()=>{console.warn("This is a server-side version of the @guardian/consent-management-platform","No consent signals will be received.")},ge=e=>()=>(ve(),e),me={__disable:ve,__enable:ge(!1),__isDisabled:ge(!1),hasInitialised:ge(!1),init:ve,showPrivacyManager:ve,version:"n/a",willShowPrivacyMessage:ge(Promise.resolve(!1)),willShowPrivacyMessageSync:ge(!1)},he=()=>(void 0===ie&&(ie=!!fe||window.location.host.endsWith(".theguardian.com")),ie),ye=he()?"https://sourcepoint.theguardian.com":"https://cdn.privacy-mgmt.com",we=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},be=function(){var e=H((function*(){return{personalisedAdvertising:!("Y"===(yield we()).uspString.charAt(2))}}));return function(){return e.apply(this,arguments)}}(),_e=()=>{return e="getUSPData",new Promise(((t,n)=>{window.__uspapi?window.__uspapi(e,1,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __uspapi found on window"))}));var e},Se=function(){var e=H((function*(){return{doNotSell:"Y"===(yield _e()).uspString.charAt(2)}}));return function(){return e.apply(this,arguments)}}(),Ce=e=>new Promise(((t,n)=>{window.__tcfapi?window.__tcfapi(e,2,((o,r)=>r?t(o):n(new Error("Unable to get ".concat(e," data"))))):n(new Error("No __tcfapi found on window"))})),ke={1:!1,2:!1,3:!1,4:!1,5:!1,6:!1,7:!1,8:!1,9:!1,10:!1},Oe=function(){var e=H((function*(){var[e,t]=yield Promise.all([Ce("getTCData"),Ce("getCustomVendorConsents")]);if(void 0===e){var n,o=null!==(n=de())&&void 0!==n?n:"undefined";throw new Error("No TC Data found with current framework: ".concat(o))}var r=J(J({},ke),e.purpose.consents),{eventStatus:a,gdprApplies:c,tcString:i,addtlConsent:s}=e,{grants:l}=t;return{consents:r,eventStatus:a,vendorConsents:Object.keys(l).sort().reduce(((e,t)=>J(J({},e),{},{[t]:l[t].vendorGrant})),{}),addtlConsent:s,gdprApplies:c,tcString:i}}));return function(){return e.apply(this,arguments)}}(),xe=[],Pe=e=>{var t;return"cmpuishown"===(null===(t=e.tcfv2)||void 0===t?void 0:t.eventStatus)},Me=(e,t)=>{if(!Pe(t)){var n=JSON.stringify(t);n!==e.lastState&&(e.fn(t),e.lastState=n)}},je=e=>{var t=fe?void 0:navigator.globalPrivacyControl;if(e.tcfv2){var n=e.tcfv2.consents;return J(J({},e),{},{canTarget:Object.keys(n).length>0&&Object.values(n).every(Boolean),framework:"tcfv2",gpcSignal:t})}return e.ccpa?J(J({},e),{},{canTarget:!e.ccpa.doNotSell,framework:"ccpa",gpcSignal:t}):e.aus?J(J({},e),{},{canTarget:e.aus.personalisedAdvertising,framework:"aus",gpcSignal:t}):J(J({},e),{},{canTarget:!1,framework:null,gpcSignal:t})},Ee=function(){var e=H((function*(){switch(de()){case"aus":return je({aus:yield be()});case"ccpa":return je({ccpa:yield Se()});case"tcfv2":return je({tcfv2:yield Oe()});default:throw new Error("no IAB consent framework found on the page")}}));return function(){return e.apply(this,arguments)}}(),$e=()=>{0!==xe.length&&Ee().then((e=>{Pe(e)||xe.forEach((t=>Me(t,e)))}))},Fe=e=>{var t={fn:e};xe.push(t),Ee().then((e=>{Me(t,e)})).catch((()=>{}))},Ae=()=>{!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){var o=n(2);e.exports=!o((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(e,t){e.exports=function(e){return"object"==typeof e?null!==e:"function"==typeof e}},function(e,t){e.exports=function(e){try{return!!e()}catch(e){return!0}}},function(e,t,n){n(4),function(){if("function"!=typeof window.__tcfapi){var e,t=[],n=window,o=n.document;!n.__tcfapi&&function e(){var t=!!n.frames.__tcfapiLocator;if(!t)if(o.body){var r=o.createElement("iframe");r.style.cssText="display:none",r.name="__tcfapiLocator",o.body.appendChild(r)}else setTimeout(e,5);return!t}()&&(n.__tcfapi=function(){for(var n=arguments.length,o=new Array(n),r=0;r<n;r++)o[r]=arguments[r];if(!o.length)return t;if("setGdprApplies"===o[0])o.length>3&&2===parseInt(o[1],10)&&"boolean"==typeof o[3]&&(e=o[3],"function"==typeof o[2]&&o[2]("set",!0));else if("ping"===o[0]){var a={gdprApplies:e,cmpLoaded:!1,apiVersion:"2.0"};"function"==typeof o[2]&&o[2](a,!0)}else t.push(o)},n.addEventListener("message",(function(e){var t="string"==typeof e.data,o={};try{o=t?JSON.parse(e.data):e.data}catch(e){}var r=o.__tcfapiCall;r&&n.__tcfapi(r.command,r.version,(function(n,o){var a={__tcfapiReturn:{returnValue:n,success:o,callId:r.callId}};t&&(a=JSON.stringify(a)),e.source.postMessage(a,"*")}),r.parameter)}),!1))}}()},function(e,t,n){var o=n(0),r=n(5).f,a=Function.prototype,c=a.toString,i=/^s*function ([^ (]*)/;o&&!("name"in a)&&r(a,"name",{configurable:!0,get:function(){try{return c.call(this).match(i)[1]}catch(e){return""}}})},function(e,t,n){var o=n(0),r=n(6),a=n(10),c=n(11),i=Object.defineProperty;t.f=o?i:function(e,t,n){if(a(e),t=c(t,!0),a(n),r)try{return i(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(e[t]=n.value),e}},function(e,t,n){var o=n(0),r=n(2),a=n(7);e.exports=!o&&!r((function(){return 7!=Object.defineProperty(a("div"),"a",{get:function(){return 7}}).a}))},function(e,t,n){var o=n(8),r=n(1),a=o.document,c=r(a)&&r(a.createElement);e.exports=function(e){return c?a.createElement(e):{}}},function(e,t,n){(function(t){var n=function(e){return e&&e.Math==Math&&e};e.exports=n("object"==typeof globalThis&&globalThis)||n("object"==typeof window&&window)||n("object"==typeof self&&self)||n("object"==typeof t&&t)||Function("return this")()}).call(this,n(9))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){var o=n(1);e.exports=function(e){if(!o(e))throw TypeError(String(e)+" is not an object");return e}},function(e,t,n){var o=n(1);e.exports=function(e,t){if(!o(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!o(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!o(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")}}])},Ne=e=>{"tcfv2"===e?Ae():function(){var e=window,t=document;function n(t){var n="string"==typeof t.data;try{var o=n?JSON.parse(t.data):t.data;if(o.__cmpCall){var r=o.__cmpCall;e.__uspapi(r.command,r.parameter,(function(e,o){var a={__cmpReturn:{returnValue:e,success:o,callId:r.callId}};t.source.postMessage(n?JSON.stringify(a):a,"*")}))}}catch(o){}}!function n(){if(!e.frames.__uspapiLocator)if(t.body){var o=t.body,r=t.createElement("iframe");r.style.cssText="display:none",r.name="__uspapiLocator",o.appendChild(r)}else setTimeout(n,5)}(),"function"!=typeof __uspapi&&(e.__uspapi=function(){var e=arguments;if(__uspapi.a=__uspapi.a||[],!e.length)return __uspapi.a;"ping"===e[0]?e[2]({gdprAppliesGlobally:!1,cmpLoaded:!1},!0):__uspapi.a.push([].slice.apply(e))},__uspapi.msgHandler=n,e.addEventListener("message",n,!1))}()},Ie=new Promise((e=>{se=e})),Te=e=>"aus"==e?"https://au.theguardian.com":he()?null:"https://test.theguardian.com";var De,Je,Ue,He,Re,Le=(e,t)=>{pe("cmp-init"),function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(Ne(e),window._sp_)throw new Error("Sourcepoint global (window._sp_) is already defined!");ue(e),$e();var n="tcfv2"==e?"gdpr":"ccpa";le("cmp","framework: ".concat(e)),le("cmp","frameworkMessageType: ".concat(n)),window._sp_queue=[],window._sp_={config:{baseEndpoint:ye,accountId:1257,propertyHref:Te(e),targetingParams:{framework:e},pubData:J(J({},t),{},{cmpInitTimeUtc:(new Date).getTime()}),events:{onConsentReady:(e,t,o)=>{le("cmp","onConsentReady ".concat(e)),e==n&&(le("cmp","consentUUID ".concat(t)),le("cmp","euconsent ".concat(o)),pe("cmp-got-consent"),setTimeout($e,0))},onMessageReady:e=>{le("cmp","onMessageReady ".concat(e)),e==n&&pe("cmp-ui-displayed")},onMessageReceiveData:(e,t)=>{le("cmp","onMessageReceiveData ".concat(e)),e==n&&(le("cmp","onMessageReceiveData ",t),se(0!==t.messageId))},onMessageChoiceSelect:(e,t,o)=>{le("cmp","onMessageChoiceSelect message_type: ".concat(e)),console.log(),e==n&&(le("cmp","onMessageChoiceSelect choice_id: ".concat(t)),le("cmp","onMessageChoiceSelect choice_type_id: ".concat(o)),11!==o&&13!==o&&15!==o||setTimeout($e,0))},onPrivacyManagerAction:function(e,t){le("cmp","onPrivacyManagerAction message_type: ".concat(e)),e==n&&le("cmp","onPrivacyManagerAction ".concat(t))},onMessageChoiceError:function(e,t){le("cmp","onMessageChoiceError ".concat(e)),e==n&&le("cmp","onMessageChoiceError ".concat(t))},onPMCancel:function(e){le("cmp","onPMCancel ".concat(e))},onSPPMObjectReady:function(){le("cmp","onSPPMObjectReady")},onError:function(e,t,o,r){le("cmp","errorCode: ".concat(e)),e==n&&(le("cmp","errorCode: ".concat(t)),le("cmp",o),le("cmp","userReset: ".concat(r)))}}}},"tcfv2"===e?window._sp_.config.gdpr={targetingParams:{framework:e}}:window._sp_.config.ccpa={targetingParams:{framework:e}};var o=document.createElement("script");o.id="sourcepoint-lib",o.src="".concat(ye,"/unified/wrapperMessagingWithoutDetection.js"),document.body.appendChild(o)}(e,t)},Be=()=>Ie,qe=function(){var e,t,n,o,r,a,c,i,s;switch(de()){case"tcfv2":null===(e=window._sp_)||void 0===e||null===(t=e.gdpr)||void 0===t||null===(n=t.loadPrivacyManagerModal)||void 0===n||n.call(t,106842);break;case"ccpa":null===(o=window._sp_)||void 0===o||null===(r=o.ccpa)||void 0===r||null===(a=r.loadPrivacyManagerModal)||void 0===a||a.call(r,540252);break;case"aus":null===(c=window._sp_)||void 0===c||null===(i=c.ccpa)||void 0===i||null===(s=i.loadPrivacyManagerModal)||void 0===s||s.call(i,540341)}},We="gu-cmp-disabled",Ge=()=>new RegExp("".concat(We,"=true(\\W+|$)")).test(document.cookie),Ve={a9:["5f369a02b8e05c308701f829"],acast:["5f203dcb1f0dea790562e20f"],braze:["5ed8c49c4b8ce4571c7ad801"],comscore:["5efefe25b8e05c06542b2a77"],criteo:["5e98e7f1b8e05c111d01b462"],"google-analytics":["5e542b3a4cd8884eb41b5a72"],"google-mobile-ads":["5f1aada6b8e05c306c0597d7"],"google-tag-manager":["5e952f6107d9d20c88e7c975"],googletag:["5f1aada6b8e05c306c0597d7"],ias:["5e7ced57b8e05c485246ccf3"],inizio:["5e37fc3e56a5e6615502f9c9"],ipsos:["5fa51b29a228638b4a1980e4"],linkedin:["5f2d22a6b8e05c02aa283b3c"],lotame:["5ed6aeb1b8e05c241a63c71f"],nielsen:["5ef5c3a5b8e05c69980eaa5b"],ophan:["5f203dbeeaaaa8768fd3226a"],permutive:["5eff0d77969bfa03746427eb"],prebid:["5f92a62aa22863685f4daa4c"],qm:["5f295fa4b8e05c76a44c3149"],redplanet:["5f199c302425a33f3f090f51"],remarketing:["5ed0eb688a76503f1016578f"],sentry:["5f0f39014effda6e8bbd2006"],teads:["5eab3d5ab8e05c2bbe33f399"],twitter:["5e71760b69966540e4554f01"],"youtube-player":["5e7ac3fae30e7d1bc1ebf5e8"]},ze=(e,t)=>{var n,o=Ve[e];if(void 0===o||Array.isArray(o)&&0===o.length)throw new Error("Vendor '".concat(e,"' not found, or with no Sourcepoint ID. ")+"If it should be added, raise an issue at https://github.com/guardian/consent-management-platform/issues");if(t.ccpa)return!t.ccpa.doNotSell;if(t.aus)return t.aus.personalisedAdvertising;var r=o.find((e=>{var n;return void 0!==(null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[e])}));if(void 0===r)return console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1;var a=null===(n=t.tcfv2)||void 0===n?void 0:n.vendorConsents[r];return void 0===a?(console.warn("No consent returned from Sourcepoint for vendor: '".concat(e,"'")),!1):a},Qe={a9:{localStorage:["apstagUserAgentClientHints","apstagCxMEnabled"]},inizio:{localStorage:["__bm_s","__bm_m"]},criteo:{cookies:["cto_bundle"],localStorage:["criteo_fast_bid_expires","cto_bundle","criteo_fast_bid","criteo_pt_cdb_mngr_metrics","__ansync3rdp_criteo"]},comscore:{cookies:["comScore"]},ipsos:{cookies:["DM_SitId1073","DM_SitId1073SecId5802","DotMetrics.AmpCookie"],localStorage:["DotmetricsSiteData","DotMetricsTimeOnPage","DotMetricsUserId","DotMetricsDeviceGuidId"]},permutive:{cookies:["permutive-id"],localStorage:["permutive-data-queries","_pubcid","permutive-pvc","permutive-data-enrichers","permutive-session","permutive-data-misc","permutive-unprocessed-pba","permutive-app","permutive-data-models","permutive-id","permutive-consent","permutive-events-cache","permutive-data-queries","permutive-events-for-page","__permutiveConfigQueryParams"],sessionStorage:["__permutiveConfigQueryParams"]},prebid:{localStorage:["_psegs","_pubcid_exp"]},googletag:{cookies:["__gpi","__gads"]},"google-analytics":{cookies:["_gid","_ga"]}};fe||window.guCmpHotFix||(window.guCmpHotFix={});var Ye,Ke=!1,Xe=new Promise((e=>{Ye=e})),Ze=fe?me:(De=window.guCmpHotFix).cmp||(De.cmp={init:e=>{var{pubData:t,country:n}=e;if(!Ge()&&!fe)if(window.guCmpHotFix.initialised){var o,r;"0.0.0-this-never-updates-in-source-code-refer-to-git-tags"!==(null===(o=window.guCmpHotFix.cmp)||void 0===o?void 0:o.version)&&console.warn("Two different versions of the CMP are running:",["0.0.0-this-never-updates-in-source-code-refer-to-git-tags",null===(r=window.guCmpHotFix.cmp)||void 0===r?void 0:r.version])}else{if(window.guCmpHotFix.initialised=!0,void 0===n)throw new Error("CMP initialised without `country` property. A 2-letter, ISO ISO_3166-1 country code is required.");var a=(e=>{var t;switch(e){case"US":t="ccpa";break;case"AU":t="aus";break;default:t="tcfv2"}return t})(n);Le(a,null!=t?t:{}),Be().then((e=>{Re=e,Ke=!0,le("cmp","initComplete")})),Ye(),Fe((e=>{requestIdleCallback((()=>{Object.keys(Qe).forEach((t=>{var n=ze(t,e),o=Qe[t];n||("cookies"in o&&o.cookies.forEach((e=>{V({name:e})})),"localStorage"in o&&o.localStorage.forEach((e=>{Z.local.remove(e)})),"sessionStorage"in o&&o.sessionStorage.forEach((e=>{Z.session.remove(e)})))}))}),{timeout:2e3})}))}},willShowPrivacyMessage:()=>Xe.then((()=>Be())),willShowPrivacyMessageSync:()=>{if(void 0!==Re)return Re;throw new Error("CMP has not been initialised. Use the async willShowPrivacyMessage() instead.")},hasInitialised:()=>Ke,showPrivacyManager:()=>{Xe.then(qe)},version:"0.0.0-this-never-updates-in-source-code-refer-to-git-tags",__isDisabled:Ge,__enable:()=>{document.cookie="".concat(We,"=false")},__disable:()=>{document.cookie="".concat(We,"=true")}});fe||(Je=window.guCmpHotFix).onConsent||(Je.onConsent=()=>new Promise(((e,t)=>{Fe((n=>{(n.tcfv2||n.ccpa||n.aus)&&e(n),t("Unknown framework")}))})));var et=fe?()=>ve():(Ue=window.guCmpHotFix).onConsentChange||(Ue.onConsentChange=Fe);function tt(e,t,n){const o=e.slice();return o[10]=t[n].title,o[11]=t[n].payload,o}function nt(e,t,n){const o=e.slice();return o[14]=t[n][0],o[15]=t[n][1],o}function ot(e,t,n){const o=e.slice();return o[18]=t[n][0],o[15]=t[n][1],o}function rt(t){let n;return{c(){n=d("h2"),n.textContent="¯\\_(ツ)_/¯",g(n,"class","svelte-hrypa8")},m(e,t){s(e,n,t)},p:e,d(e){e&&l(n)}}}function at(e){let t,n,o,r,a,u,v=e[1].aus.personalisedAdvertising+"";return{c(){t=d("h2"),t.textContent="aus.personalisedAdvertising",n=f(),o=d("span"),r=p(v),g(t,"class","svelte-hrypa8"),g(o,"data-personalised-advertising",a=e[1].aus.personalisedAdvertising),g(o,"class",u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")},m(e,a){s(e,t,a),s(e,n,a),s(e,o,a),i(o,r)},p(e,t){2&t&&v!==(v=e[1].aus.personalisedAdvertising+"")&&h(r,v),2&t&&a!==(a=e[1].aus.personalisedAdvertising)&&g(o,"data-personalised-advertising",a),2&t&&u!==(u=c(e[1].aus.personalisedAdvertising?"yes":"no")+" svelte-hrypa8")&&g(o,"class",u)},d(e){e&&l(t),e&&l(n),e&&l(o)}}}function ct(e){let t,n,o,r,a,c=e[1].ccpa.doNotSell+"";return{c(){t=d("h2"),t.textContent="ccpa.doNotSell",n=f(),o=d("span"),r=p(c),g(t,"class","svelte-hrypa8"),g(o,"class","label svelte-hrypa8"),g(o,"data-donotsell",a=e[1].ccpa.doNotSell)},m(e,a){s(e,t,a),s(e,n,a),s(e,o,a),i(o,r)},p(e,t){2&t&&c!==(c=e[1].ccpa.doNotSell+"")&&h(r,c),2&t&&a!==(a=e[1].ccpa.doNotSell)&&g(o,"data-donotsell",a)},d(e){e&&l(t),e&&l(n),e&&l(o)}}}function it(e){let t,n,o,r,a,c,v,m,y,w,b,_=e[1].tcfv2.eventStatus+"",S=Object.entries(e[1].tcfv2.consents),C=[];for(let t=0;t<S.length;t+=1)C[t]=st(ot(e,S,t));let k=Object.entries(e[1].tcfv2.vendorConsents),O=[];for(let t=0;t<k.length;t+=1)O[t]=lt(nt(e,k,t));return{c(){t=d("h2"),t.textContent="tcfv2.eventStatus",n=f(),o=d("span"),r=p(_),a=f(),c=d("h2"),c.textContent="tcfv2.consents",v=f();for(let e=0;e<C.length;e+=1)C[e].c();m=f(),y=d("h2"),y.textContent="tcfv2.vendorConsents",w=f();for(let e=0;e<O.length;e+=1)O[e].c();b=p(""),g(t,"class","svelte-hrypa8"),g(o,"class","label svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(y,"class","svelte-hrypa8")},m(e,l){s(e,t,l),s(e,n,l),s(e,o,l),i(o,r),s(e,a,l),s(e,c,l),s(e,v,l);for(let t=0;t<C.length;t+=1)C[t].m(e,l);s(e,m,l),s(e,y,l),s(e,w,l);for(let t=0;t<O.length;t+=1)O[t].m(e,l);s(e,b,l)},p(e,t){if(2&t&&_!==(_=e[1].tcfv2.eventStatus+"")&&h(r,_),2&t){let n;for(S=Object.entries(e[1].tcfv2.consents),n=0;n<S.length;n+=1){const o=ot(e,S,n);C[n]?C[n].p(o,t):(C[n]=st(o),C[n].c(),C[n].m(m.parentNode,m))}for(;n<C.length;n+=1)C[n].d(1);C.length=S.length}if(2&t){let n;for(k=Object.entries(e[1].tcfv2.vendorConsents),n=0;n<k.length;n+=1){const o=nt(e,k,n);O[n]?O[n].p(o,t):(O[n]=lt(o),O[n].c(),O[n].m(b.parentNode,b))}for(;n<O.length;n+=1)O[n].d(1);O.length=k.length}},d(e){e&&l(t),e&&l(n),e&&l(o),e&&l(a),e&&l(c),e&&l(v),u(C,e),e&&l(m),e&&l(y),e&&l(w),u(O,e),e&&l(b)}}}function st(e){let t,n,o,r,a,u=e[18]+"";return{c(){t=d("span"),n=p(u),g(t,"class",o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8"),g(t,"data-purpose",r=e[18]),g(t,"data-consent",a=e[15])},m(e,o){s(e,t,o),i(t,n)},p(e,i){2&i&&u!==(u=e[18]+"")&&h(n,u),2&i&&o!==(o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",o),2&i&&r!==(r=e[18])&&g(t,"data-purpose",r),2&i&&a!==(a=e[15])&&g(t,"data-consent",a)},d(e){e&&l(t)}}}function lt(e){let t,n,o,r=e[14]+"";return{c(){t=d("span"),n=p(r),g(t,"class",o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")},m(e,o){s(e,t,o),i(t,n)},p(e,a){2&a&&r!==(r=e[14]+"")&&h(n,r),2&a&&o!==(o=c(JSON.parse(e[15])?"yes":"no")+" svelte-hrypa8")&&g(t,"class",o)},d(e){e&&l(t)}}}function ut(e){let t,n,o,r,a,c,u,v,m=e[10]+"",y=JSON.stringify(e[11],null,4)+"";return{c(){t=d("li"),n=d("details"),o=d("summary"),r=p(m),a=f(),c=d("pre"),u=p(y),v=f(),g(o,"class","svelte-hrypa8"),g(c,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8"),g(t,"class","svelte-hrypa8")},m(e,l){s(e,t,l),i(t,n),i(n,o),i(o,r),i(n,a),i(n,c),i(c,u),i(t,v)},p(e,t){4&t&&m!==(m=e[10]+"")&&h(r,m),4&t&&y!==(y=JSON.stringify(e[11],null,4)+"")&&h(u,y)},d(e){e&&l(t)}}}function dt(t){let n,r,a,m,h,y,w,b,_,S,C,k,O,x,P,M,j,E,$,F,A,N,I,T,D,J,U,H,R;function L(e,t){return e[1].tcfv2?it:e[1].ccpa?ct:e[1].aus?at:rt}let B=L(t),q=B(t),W=t[2],G=[];for(let e=0;e<W.length;e+=1)G[e]=ut(tt(t,W,e));return{c(){n=d("main"),r=d("nav"),a=d("button"),a.textContent="open privacy manager",m=f(),h=d("button"),h.textContent="clear preferences",y=f(),w=d("label"),b=d("input"),_=p("\n\t\t\tin RoW:"),S=d("strong"),S.textContent="TCFv2",k=f(),O=d("label"),x=d("input"),P=p("\n\t\t\tin USA:\n\t\t\t"),M=d("strong"),M.textContent="CCPA",E=f(),$=d("label"),F=d("input"),A=p("\n\t\t\tin Australia:\n\t\t\t"),N=d("strong"),N.textContent="CCPA-like",T=f(),D=d("div"),q.c(),J=f(),U=d("ol");for(let e=0;e<G.length;e+=1)G[e].c();g(a,"data-cy","pm"),g(a,"class","svelte-hrypa8"),g(h,"class","svelte-hrypa8"),g(b,"type","radio"),b.__value="tcfv2",b.value=b.__value,g(b,"class","svelte-hrypa8"),t[6][0].push(b),g(S,"class","svelte-hrypa8"),g(w,"class",C=c("tcfv2"==t[0]?"selected":"none")+" svelte-hrypa8"),g(x,"type","radio"),x.__value="ccpa",x.value=x.__value,g(x,"class","svelte-hrypa8"),t[6][0].push(x),g(M,"class","svelte-hrypa8"),g(O,"class",j=c("ccpa"==t[0]?"selected":"none")+" svelte-hrypa8"),g(F,"type","radio"),F.__value="aus",F.value=F.__value,g(F,"class","svelte-hrypa8"),t[6][0].push(F),g(N,"class","svelte-hrypa8"),g($,"class",I=c("aus"==t[0]?"selected":"none")+" svelte-hrypa8"),g(r,"class","svelte-hrypa8"),g(D,"id","consent-state"),g(D,"class","svelte-hrypa8"),g(U,"id","events"),g(U,"class","svelte-hrypa8"),g(n,"class","svelte-hrypa8")},m(e,o){s(e,n,o),i(n,r),i(r,a),i(r,m),i(r,h),i(r,y),i(r,w),i(w,b),b.checked=b.__value===t[0],i(w,_),i(w,S),i(r,k),i(r,O),i(O,x),x.checked=x.__value===t[0],i(O,P),i(O,M),i(r,E),i(r,$),i($,F),F.checked=F.__value===t[0],i($,A),i($,N),i(n,T),i(n,D),q.m(D,null),i(n,J),i(n,U);for(let e=0;e<G.length;e+=1)G[e].m(U,null);H||(R=[v(a,"click",Ze.showPrivacyManager),v(h,"click",t[3]),v(b,"change",t[5]),v(b,"change",t[4]),v(x,"change",t[7]),v(x,"change",t[4]),v(F,"change",t[8]),v(F,"change",t[4])],H=!0)},p(e,[t]){if(1&t&&(b.checked=b.__value===e[0]),1&t&&C!==(C=c("tcfv2"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(w,"class",C),1&t&&(x.checked=x.__value===e[0]),1&t&&j!==(j=c("ccpa"==e[0]?"selected":"none")+" svelte-hrypa8")&&g(O,"class",j),1&t&&(F.checked=F.__value===e[0]),1&t&&I!==(I=c("aus"==e[0]?"selected":"none")+" svelte-hrypa8")&&g($,"class",I),B===(B=L(e))&&q?q.p(e,t):(q.d(1),q=B(e),q&&(q.c(),q.m(D,null))),4&t){let n;for(W=e[2],n=0;n<W.length;n+=1){const o=tt(e,W,n);G[n]?G[n].p(o,t):(G[n]=ut(o),G[n].c(),G[n].m(U,null))}for(;n<G.length;n+=1)G[n].d(1);G.length=W.length}},i:e,o:e,d(e){e&&l(n),t[6][0].splice(t[6][0].indexOf(b),1),t[6][0].splice(t[6][0].indexOf(x),1),t[6][0].splice(t[6][0].indexOf(F),1),q.d(),u(G,e),H=!1,o(R)}}}function pt(e,t,n){let o,r;switch(window.location.hash){case"#tcfv2":localStorage.setItem("framework",JSON.stringify("tcfv2"));break;case"#ccpa":localStorage.setItem("framework",JSON.stringify("ccpa"));break;case"#aus":localStorage.setItem("framework",JSON.stringify("aus"));break;default:window.location.hash="tcfv2",localStorage.setItem("framework",JSON.stringify("tcfv2"))}function a(e){n(2,r=[...r,e]),le("cmp",e)}window.guardian.logger.subscribeTo("cmp"),window.guCmpHotFix=new Proxy(window.guCmpHotFix,{set:(e,t,n)=>(e[t]=n,console.info("%cwindow.guCmpHotFix","color: deeppink;",{...window.guCmpHotFix}),!0)});let c=()=>{localStorage.clear(),document.cookie.split(";").forEach((e=>{document.cookie=e.replace(/^ +/,"").replace(/=.*/,`=;expires=${(new Date).toUTCString()};path=/`)})),window.location.reload()},i=JSON.parse(localStorage.getItem("framework"));Ze.willShowPrivacyMessage().then((e=>{a({title:"cmp.willShowPrivacyMessage",payload:e})})),et((e=>{a({title:"onConsentChange",payload:e}),n(1,o=e)})),b((async()=>{let e="";switch(i){case"tcfv2":e="GB";break;case"ccpa":e="US";break;case"aus":e="AU"}Ze.init({country:e}),Ze.init({country:e}),Ze.init({country:e}),Ze.init({country:e})}));return n(1,o={}),n(2,r=[]),[i,o,r,c,()=>{localStorage.setItem("framework",JSON.stringify(i)),window.location.hash=i,c()},function(){i=this.__value,n(0,i)},[[]],function(){i=this.__value,n(0,i)},function(){i=this.__value,n(0,i)}]}fe||(He=window.guCmpHotFix).getConsentFor||(He.getConsentFor=ze);var ft=new class extends T{constructor(t){super(),function(t,r,a,c,i,s,u){var d=arguments.length>7&&void 0!==arguments[7]?arguments[7]:[-1],p=y;w(t);var f=t.$$={fragment:null,ctx:[],props:s,update:e,not_equal:i,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(p?p.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:r.target||p.$$.root};u&&u(f.root);var v=!1;if(f.ctx=a?a(t,r.props||{},(function(e,n){var o=!(arguments.length<=2)&&arguments.length-2?arguments.length<=2?void 0:arguments[2]:n;return f.ctx&&i(f.ctx[e],f.ctx[e]=o)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](o),v&&I(t,e)),n})):[],f.update(),v=!0,o(f.before_update),f.fragment=!!c&&c(f.ctx),r.target){if(r.hydrate){var g=m(r.target);f.fragment&&f.fragment.l(g),g.forEach(l)}else f.fragment&&f.fragment.c();r.intro&&A(t.$$.fragment),N(t,r.target,r.anchor,r.customElement),E()}w(p)}(this,t,pt,dt,a,{})}}({target:document.body});export{ft as default};
//# sourceMappingURL=index.js.map
