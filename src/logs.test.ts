import { postConsentState, _ } from './logs';
import { readBwidCookie } from './cookies';

const { CMP_LOGS_URL, DUMMY_BROWSER_ID, LOGS_VERSION } = _;

jest.mock('./cookies', () => ({
    readBwidCookie: jest.fn(),
}));

describe('Logs', () => {
    const guState = {};
    const iabString = 'g0BbleDyg0_0k!';
    const pAdvertisingState = true;
    const source = 'www';
    const variant = 'testVariant';

    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation(() => {
            console.log('****');
        });
    });

    afterEach(() => {
        global.fetch.mockClear();
        delete global.fetch;
    });

    // it('throws error if in PROD and bwid cookies is not present'), () => {});

    describe('posts correct browser ID', () => {
        it('when bwid cookie is available.', () => {
            const fakeBwid = 'foo';

            readBwidCookie.mockReturnValue(fakeBwid);

            postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            );

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(CMP_LOGS_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: LOGS_VERSION,
                    iab: iabString,
                    source,
                    purposes: {
                        personalisedAdvertising: pAdvertisingState,
                    },
                    browserId: fakeBwid,
                    variant,
                }),
            });
        });
        it('when bwid cookie is not present', () => {
            readBwidCookie.mockReturnValue(null);

            postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            );

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(CMP_LOGS_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: LOGS_VERSION,
                    iab: iabString,
                    source,
                    purposes: {
                        personalisedAdvertising: pAdvertisingState,
                    },
                    browserId: DUMMY_BROWSER_ID,
                    variant,
                }),
            });
        });
    });
});
