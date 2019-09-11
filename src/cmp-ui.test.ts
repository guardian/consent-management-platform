import * as Cookies from 'js-cookie';
import { setupMessageHandlers, canShow } from './cmp-ui';
import { CMP_DOMAIN, CMP_READY_MSG, CMP_CLOSE_MSG } from './config';

jest.mock('js-cookie');

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('setupMessageHandlers', () => {
        let fakeMessage;
        const onReadyCmp = jest.fn();
        const onCloseCmp = jest.fn();

        beforeEach(() => {
            window.addEventListener = jest.fn((event, cb) => {
                if (event === 'message') {
                    fakeMessage = cb;
                }
            });
        });

        it('exectutes onReadyCmp if CMP_READY_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: CMP_READY_MSG,
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).toHaveBeenCalledTimes(1);
        });

        it('does not exectute onReadyCmp if not CMP_READY_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: 'foo',
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).not.toHaveBeenCalled();
        });

        it('exectutes onReadyCmp if CMP_READY_MSG not from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: 'foo',
                data: CMP_READY_MSG,
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).not.toHaveBeenCalled();
        });

        it('exectutes onCloseCmp if CMP_CLOSE_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: CMP_CLOSE_MSG,
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).toHaveBeenCalledTimes(1);
        });

        it('does not exectute onCloseCmp if not CMP_CLOSE_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: 'foo',
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).not.toHaveBeenCalled();
        });

        it('exectutes onCloseCmp if CMP_CLOSE_MSG not from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: 'foo',
                data: CMP_CLOSE_MSG,
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).not.toHaveBeenCalled();
        });
    });

    describe('canShow', () => {
        it('canShow returns false if no cookie with IAB_COOKIE_NAME exists', () => {
            Cookies.get.mockReturnValueOnce(undefined);
            expect(canShow()).toBe(false);
        });

        it('canShow returns true if  cookie with IAB_COOKIE_NAME exists', () => {
            Cookies.get.mockReturnValueOnce('foo');
            expect(canShow()).toBe(true);
        });
    });
});
