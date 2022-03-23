/* eslint-disable -- this is third party code */
/* istanbul ignore file */

export const stub_tcfv2 = () => {
	!(function () {
		var t = function () {
			var t,
				e,
				o = [],
				n = window,
				r = n;
			for (; r;) {
				try {
					if (r.frames.__tcfapiLocator) {
						t = r;
						break;
					}
				} catch (t) {
				}
				if (r === n.top) break;
				r = n.parent;
			}
			t ||
			(!(function t() {
				var e = n.document,
					o = !!n.frames.__tcfapiLocator;
				if (!o)
					if (e.body) {
						var r = e.createElement("iframe");
						(r.style.cssText = "display:none"),
							(r.name = "__tcfapiLocator"),
							e.body.appendChild(r);
					} else setTimeout(t, 5);
				return !o;
			})(),
				(n.__tcfapi = function () {
					for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
						n[r] = arguments[r];
					if (!n.length) return o;
					"setGdprApplies" === n[0]
						? n.length > 3 &&
						2 === parseInt(n[1], 10) &&
						"boolean" == typeof n[3] &&
						((e = n[3]), "function" == typeof n[2] && n[2]("set", !0))
						: "ping" === n[0]
							? "function" == typeof n[2] &&
							n[2]({gdprApplies: e, cmpLoaded: !1, cmpStatus: "stub"})
							: o.push(n);
				}),
				n.addEventListener(
					"message",
					function (t) {
						var e = "string" == typeof t.data,
							o = {};
						if (e)
							try {
								o = JSON.parse(t.data);
							} catch (t) {
							}
						else o = t.data;
						var n = "object" === _typeof(o) ? o.__tcfapiCall : null;
						n &&
						window.__tcfapi(
							n.command,
							n.version,
							function (o, r) {
								var a = {
									__tcfapiReturn: {
										returnValue: o,
										success: r,
										callId: n.callId,
									},
								};
								t &&
								t.source &&
								t.source.postMessage &&
								t.source.postMessage(e ? JSON.stringify(a) : a, "*");
							},
							n.parameter
						);
					},
					!1
				));
		}
	});
};
