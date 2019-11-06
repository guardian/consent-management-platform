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
    const dataToPost = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: '',
    };

    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        global.fetch.mockClear();
        delete global.fetch;
    });

    it('throws error if in PROD and bwid cookies is not present', () => {});

    describe('posts correct browser ID', () => {
        it('when bwid cookie is available.', () => {
            const fakeBwid = 'foo';

            readBwidCookie.mockReturnValue(fakeBwid);

            return postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            ).then(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(global.fetch).toHaveBeenCalledWith(CMP_LOGS_URL, {
                    ...dataToPost,
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
        });

        it('when bwid cookie is not available', () => {
            readBwidCookie.mockReturnValue(null);

            return postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            ).then(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(global.fetch).toHaveBeenCalledWith(CMP_LOGS_URL, {
                    ...dataToPost,
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
});
