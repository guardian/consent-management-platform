/* eslint-disable no-underscore-dangle */
import http from 'http';
import url from 'url';
import { init } from './sourcepoint';
import { ACCOUNT_ID } from '../lib/sourcepointConfig';

jest.mock('../onConsentChange', () => ({
	invokeCallbacks: jest.fn(),
}));

describe('Sourcepoint CCPA', () => {
	afterEach(() => {
		window._sp_ccpa = undefined;
	});

	it('should throw error if window._sp_ccpa exists', () => {
		window._sp_ccpa = {};
		expect(init).toThrow();
	});

	it("should initialize window._sp_ccpa with the correct config if it doesn't exist", () => {
		init();
		expect(window._sp_ccpa).toBeDefined();
		expect(window._sp_ccpa.config).toBeDefined();
		expect(window._sp_ccpa.config.mmsDomain).toEqual(
			'https://consent.theguardian.com',
		);
		expect(window._sp_ccpa.config.accountId).toEqual(ACCOUNT_ID);
		expect(window._sp_ccpa.config.targetingParams.framework).toEqual('ccpa');
		expect(window._sp_ccpa.config.events).toBeDefined();
		expect(typeof window._sp_ccpa.config.events.onConsentReady).toBe(
			'function',
		);

		expect(typeof window._sp_ccpa.config.events.onMessageReceiveData).toBe(
			'function',
		);
	});

	it('injects the lib', () => {
		init();
		expect(document.getElementById('sourcepoint-ccpa-lib')).toBeTruthy();
	});

	it('points at a real file', (done) => {
		init();
		const src = document
			?.getElementById('sourcepoint-ccpa-lib')
			?.getAttribute('src');

		const { host, path } = url.parse(src ?? '');

		const req = http.request({ method: 'HEAD', host, port: 80, path }, () =>
			done(),
		);
		req.end();
	});
});
