import { init } from './sourcepoint';
import http from 'http';
import url from 'url';

describe('Sourcepoint', () => {
    init();

    it('injects the stub', () => {
        expect(document.getElementById('sourcepoint-ccpa-stub')).toBeTruthy();
    });

    it('injects the lib', () => {
        expect(document.getElementById('sourcepoint-ccpa-lib')).toBeTruthy();
    });

    it('points at a real file', done => {
        const { host, path } = url.parse(
            document.getElementById('sourcepoint-ccpa-lib').getAttribute('src'),
        );
        const req = http.request({ method: 'HEAD', host, port: 80, path }, () =>
            done(),
        );
        req.end();
    });
});
