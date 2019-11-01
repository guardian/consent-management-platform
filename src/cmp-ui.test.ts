import { canShow } from './cmp-ui';
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

    describe('canShow', () => {
        it('canShow returns true if readIabCookie returns null', () => {
            readIabCookie.mockReturnValue(null);
            expect(canShow()).toBe(true);
        });

        it('canShow returns false if readIabCookie returns truthy value', () => {
            readIabCookie.mockReturnValue('foo');
            expect(canShow()).toBe(false);
        });

        // TODO: Restore tests below once we start saving GU cookie
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
