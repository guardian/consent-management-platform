import { postConsentState, _ } from './logs';
import { readBwidCookie } from './cookies';
import { isProd } from './config';

const {
    CMP_LOGS_PROD_URL,
    CMP_LOGS_NOT_PROD_URL,
    DUMMY_BROWSER_ID,
    LOGS_VERSION,
} = _;

jest.mock('./cookies', () => ({
    readBwidCookie: jest.fn(),
}));

jest.mock('./config', () => ({
    isProd: jest.fn(),
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
    };

    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
        isProd.mockReturnValue(false);
    });

    afterEach(() => {
        global.fetch.mockClear();
        delete global.fetch;
    });

    describe('sets log parameters correctly', () => {
        const fakeBwid = 'foo';

        it('when on PROD and bwid cookie is available', () => {
            readBwidCookie.mockReturnValue(fakeBwid);
            isProd.mockReturnValue(true);

            return postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            ).then(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(global.fetch).toHaveBeenCalledWith(CMP_LOGS_PROD_URL, {
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

        it('when not on PROD and bwid cookie is available.', () => {
            readBwidCookie.mockReturnValue(fakeBwid);

            return postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            ).then(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(global.fetch).toHaveBeenCalledWith(
                    CMP_LOGS_NOT_PROD_URL,
                    {
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
                    },
                );
            });
        });

        it('when not on PROD and bwid cookie is not available', () => {
            readBwidCookie.mockReturnValue(null);

            return postConsentState(
                guState,
                iabString,
                pAdvertisingState,
                source,
                variant,
            ).then(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(global.fetch).toHaveBeenCalledWith(
                    CMP_LOGS_NOT_PROD_URL,
                    {
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
                    },
                );
            });
        });
    });
    describe('throws an error', () => {
        it('when on PROD and bwid cookies is not available', () => {
            isProd.mockReturnValue(true);
            expect(() => {
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                );
            }).toThrowError();
        });
        it('when fetch fails', () => {});
    });
});
