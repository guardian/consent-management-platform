import { postConsentState } from './logs';
import { readBwidCookie } from './cookies';

jest.mock('./cookies', () => ({
    readBwidCookie: jest.fn(),
}));

describe('Logs', () => {
    // const guState = {};
    // const iabString = 'g0BbleDyg0_0k!';
    // const pAdvertisingState = true;
    // const source = 'www';
    // const variant = 'testVariant';

    it('throws error if in PROD and bwid cookies is not present'), () => {});
    describe('posts correct browser ID', () => {
        it('when bwid cookie is available.', () => {
            const fakeBwid = 'foo';

            readBwidCookie.mockReturnValue(fakeBwid);

            // postConsentState(guState, iabString, pAdvertisingState, source, variant);
        });
        it('when bwid cookie is not present', () => {
            readBwidCookie.mockReturnValue(null);
        });
    });
});
