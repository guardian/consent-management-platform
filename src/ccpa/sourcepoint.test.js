import http from 'http';
import url from 'url';
import { init } from './sourcepoint';

describe('Sourcepoint', () => {
	init();

	it('injects the lib', () => {
		expect(document.getElementById('sourcepoint-ccpa-lib')).toBeTruthy();
	});

	it('points at a real file', (done) => {
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
