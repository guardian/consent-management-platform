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
        const src = url.parse(
            document.getElementById('sourcepoint-ccpa-lib').getAttribute('src'),
        );
        const req = http.request(
            { method: 'HEAD', host: src.host, port: 80, path: src.path },
            () => done(),
        );
        req.end();
    });
});
