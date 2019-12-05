import { postConsentState, _ } from './logs';
import { isProd } from './config';
import { readBwidCookie } from './cookies';
import { handleError } from './error';

jest.mock('./config', () => ({
    isProd: jest.fn(),
}));

jest.mock('./cookies', () => ({
    readBwidCookie: jest.fn(),
}));

jest.mock('./error', () => ({
    handleError: jest.fn(),
}));

describe('Logs', () => {
    const guState = {};
    const iabString = 'g0BbleDyg0_0k!';
    const pAdvertisingState = true;
    const source = 'www';
    const variant = 'testVariant';
    const fakeBwid = 'foo';
    const dataToPost = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const okResponse = {
        ok: true,
    };

    beforeEach(() => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => Promise.resolve(okResponse));
        isProd.mockReturnValue(false);
    });

    afterEach(() => {
        global.fetch.mockClear();
        delete global.fetch;
        jest.resetAllMocks();
    });

    describe('sets log parameters correctly', () => {
        it('when on PROD and bwid cookie is available', () => {
            readBwidCookie.mockReturnValue(fakeBwid);
            isProd.mockReturnValue(true);

            return expect(
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                ),
            )
                .resolves.toBeUndefined()
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledTimes(1);
                    expect(global.fetch).toHaveBeenCalledWith(
                        _.CMP_LOGS_PROD_URL,
                        {
                            ...dataToPost,
                            body: JSON.stringify({
                                version: _.LOGS_VERSION,
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

        it('when not on PROD and bwid cookie is available.', () => {
            readBwidCookie.mockReturnValue(fakeBwid);

            return expect(
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                ),
            )
                .resolves.toBeUndefined()
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledTimes(1);
                    expect(global.fetch).toHaveBeenCalledWith(
                        _.CMP_LOGS_NOT_PROD_URL,
                        {
                            ...dataToPost,
                            body: JSON.stringify({
                                version: _.LOGS_VERSION,
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

            return expect(
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                ),
            )
                .resolves.toBeUndefined()
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledTimes(1);
                    expect(global.fetch).toHaveBeenCalledWith(
                        _.CMP_LOGS_NOT_PROD_URL,
                        {
                            ...dataToPost,
                            body: JSON.stringify({
                                version: _.LOGS_VERSION,
                                iab: iabString,
                                source,
                                purposes: {
                                    personalisedAdvertising: pAdvertisingState,
                                },
                                browserId: _.DUMMY_BROWSER_ID,
                                variant,
                            }),
                        },
                    );
                });
        });
    });

    describe('throws an error and returns a rejected Promise', () => {
        it('when on PROD and bwid cookies is not available', () => {
            isProd.mockReturnValue(true);
            return expect(
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                ),
            )
                .rejects.toBeUndefined()
                .then(() => {
                    expect(handleError).toHaveBeenCalledTimes(1);
                    expect(handleError).toHaveBeenCalledWith(
                        'Error getting browserID in PROD',
                    );
                });
        });

        it('when fetch fails', () => {
            const notOkResponse = {
                ok: false,
                status: 500,
                statusText: 'failed',
            };

            global.fetch = jest
                .fn()
                .mockImplementation(() => Promise.resolve(notOkResponse));

            return expect(
                postConsentState(
                    guState,
                    iabString,
                    pAdvertisingState,
                    source,
                    variant,
                ),
            )
                .rejects.toBeUndefined()
                .then(() => {
                    expect(global.fetch).toHaveBeenCalledTimes(1);
                    expect(handleError).toHaveBeenCalledTimes(1);
                    expect(handleError).toHaveBeenCalledWith(
                        `Error posting to logs: Error: ${notOkResponse.status} | ${notOkResponse.statusText}`,
                    );
                });
        });
    });
});
