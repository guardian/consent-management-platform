import { setupMessageHandlers, canShow } from './cmp-ui';
import { CMP_DOMAIN, CMP_READY_MSG, CMP_CLOSE_MSG } from './config';
import {
    // readGuCookie as _readGuCookie,
    readIabCookie as _readIabCookie,
} from './cookies';

// const readGuCookie = _readGuCookie;
const readIabCookie = _readIabCookie;

jest.mock('./cookies', () => ({
    // readGuCookie: jest.fn(),
    readIabCookie: jest.fn(),
}));

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
                data: {
                    msgType: CMP_READY_MSG,
                },
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).toHaveBeenCalledTimes(1);
        });

        it('does not exectute onReadyCmp if not CMP_READY_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: {
                    msgType: 'foo',
                },
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).not.toHaveBeenCalled();
        });

        it('exectutes onReadyCmp if CMP_READY_MSG not from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: 'foo',
                data: {
                    msgType: CMP_READY_MSG,
                },
            };

            fakeMessage(fakeEvent);

            expect(onReadyCmp).not.toHaveBeenCalled();
        });

        it('exectutes onCloseCmp if CMP_CLOSE_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: CMP_DOMAIN,
                data: {
                    msgType: CMP_CLOSE_MSG,
                },
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).toHaveBeenCalledTimes(1);
        });

        it('does not exectute onCloseCmp if not CMP_CLOSE_MSG from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: { msgType: CMP_DOMAIN },
                data: 'foo',
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).not.toHaveBeenCalled();
        });

        it('exectutes onCloseCmp if CMP_CLOSE_MSG not from CMP_DOMAIN', () => {
            setupMessageHandlers(onReadyCmp, onCloseCmp);

            const fakeEvent = {
                origin: 'foo',
                data: { msgType: CMP_CLOSE_MSG },
            };

            fakeMessage(fakeEvent);

            expect(onCloseCmp).not.toHaveBeenCalled();
        });
    });

    describe('canShow', () => {
        it('canShow returns true if readIabCookie returns null', () => {
            readIabCookie.mockReturnValue(null);
            expect(canShow()).toBe(true);
        });

        it('canShow returns false if readIabCookie returns truthy value', () => {
            readIabCookie.mockReturnValue('foo');
            expect(canShow()).toBe(false);
        });
        // it('canShow returns true if readGuCookie returns null', () => {
        //     readIabCookie.mockReturnValue('foo');
        //     readGuCookie.mockReturnValue(null);
        //     expect(canShow()).toBe(true);
        // });

        // it('canShow returns true if readIabCookie returns null', () => {
        //     readIabCookie.mockReturnValue(null);
        //     readGuCookie.mockReturnValue('foo');
        //     expect(canShow()).toBe(true);
        // });
        // it('canShow returns true if readIabCookie and readGuCookie return null', () => {
        //     readIabCookie.mockReturnValue(null);
        //     readGuCookie.mockReturnValue(null);
        //     expect(canShow()).toBe(true);
        // });

        // it('canShow returns false if readIabCookie and readGuCookie return truthy values', () => {
        //     readIabCookie.mockReturnValue('foo');
        //     readGuCookie.mockReturnValue('bar');
        //     expect(canShow()).toBe(false);
        // });
    });
});
