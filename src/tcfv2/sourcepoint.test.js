import http from 'http';
import url from 'url';
import { ACCOUNT_ID, ENDPOINT } from '../lib/sourcepointConfig';
import { init } from './sourcepoint';

describe('Sourcepoint TCF', () => {
	afterEach(() => {
		window._sp_ = undefined;
	});

	it('should throw error if window._sp_ exists', () => {
		window._sp_ = {};
		expect(init).toThrow();
	});

	it("should initialize window._sp_ with the correct config if it doesn't exist", () => {
		init();
		expect(window._sp_).toBeDefined();
		expect(window._sp_.config).toBeDefined();
		expect(window._sp_.config.baseEndpoint).toEqual(ENDPOINT);
		expect(window._sp_.config.accountId).toEqual(ACCOUNT_ID);
		expect(window._sp_.config.targetingParams.framework).toEqual('tcfv2');
		expect(window._sp_.config.events).toBeDefined();
		expect(typeof window._sp_.config.events.onConsentReady).toBe(
			'function',
		);
		expect(typeof window._sp_.config.events.onMessageReceiveData).toBe(
			'function',
		);
	});

	it('injects the lib', () => {
		init();
		expect(document.getElementById('sourcepoint-tcfv2-lib')).toBeTruthy();
	});

	it('points at a real file', (done) => {
		init();
		const src = document
			.getElementById('sourcepoint-tcfv2-lib')
			?.getAttribute('src');

		const { host, path } = url.parse(src ?? '');

		const req = http.request({ method: 'HEAD', host, port: 80, path }, () =>
			done(),
		);
		req.end();
	});

	it('should accept pubData', () => {
		const now = new Date().getTime();
		init({
			browserId: 'abc123',
			pageViewId: 'abcdef',
			cmpInitTimeUtc: 1601511014537,
		});
		expect(window._sp_.config.pubData.browserId).toEqual('abc123');
		expect(window._sp_.config.pubData.pageViewId).toEqual('abcdef');
		expect(
			window._sp_.config.pubData.cmpInitTimeUtc,
		).toBeGreaterThanOrEqual(now);
	});

	it('should handle no pubData', () => {
		const now = new Date().getTime();
		init();
		expect(
			window._sp_.config.pubData.cmpInitTimeUtc,
		).toBeGreaterThanOrEqual(now);
	});
});
