import { shouldShow } from './cmp-ui';
import {
    // readGuCookie as _readGuCookie,
    readIabCookie as _readIabCookie,
    readLegacyCookie as _readLegacyCookie,
} from './cookies';

// const readGuCookie = _readGuCookie;
const readIabCookie = _readIabCookie;
const readLegacyCookie = _readLegacyCookie;

jest.mock('./cookies', () => ({
    // readGuCookie: jest.fn(),
    readIabCookie: jest.fn(),
    readLegacyCookie: jest.fn(),
}));

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('shouldShow', () => {
        describe('with shouldRepermission set to true', () => {
            it('shouldShow returns true if readIabCookie and readyLegacyCookie both return null', () => {
                readIabCookie.mockReturnValue(null);
                readLegacyCookie.mockReturnValue(null);
                expect(shouldShow(true)).toBe(true);
            });
            it('shouldShow returns false if readIabCookie returns a truthy value and readLegacyCookie returns null', () => {
                readIabCookie.mockReturnValue('foo');
                readLegacyCookie.mockReturnValue(null);
                expect(shouldShow(true)).toBe(false);
            });
            it('shouldShow returns true if readIabCookie returns null and readLegacyCookie returns a truthy value', () => {
                readIabCookie.mockReturnValue(null);
                readLegacyCookie.mockReturnValue('foo');
                expect(shouldShow(true)).toBe(true);
            });
            it('shouldShow returns false if readIabCookie and readLegacyCookie both return a truthy value', () => {
                readIabCookie.mockReturnValue('foo');
                readLegacyCookie.mockReturnValue('foo');
                expect(shouldShow(true)).toBe(false);
            });
        });
        describe('with shouldRepermission set to false', () => {
            it('shouldShow returns true if readIabCookie and readyLegacyCookie both return null', () => {
                readIabCookie.mockReturnValue(null);
                readLegacyCookie.mockReturnValue(null);
                expect(shouldShow(false)).toBe(true);
            });
            it('shouldShow returns false if readIabCookie returns a truthy value and readLegacyCookie returns null', () => {
                readIabCookie.mockReturnValue('foo');
                readLegacyCookie.mockReturnValue(null);
                expect(shouldShow(false)).toBe(false);
            });
            it('shouldShow returns false if readIabCookie returns null and readLegacyCookie returns a truthy value', () => {
                readIabCookie.mockReturnValue(null);
                readLegacyCookie.mockReturnValue('foo');
                expect(shouldShow(false)).toBe(false);
            });
            it('shouldShow returns false if readIabCookie and readLegacyCookie both return a truthy value', () => {
                readIabCookie.mockReturnValue('foo');
                readLegacyCookie.mockReturnValue('foo');
                expect(shouldShow(false)).toBe(false);
            });
        });

        // TODO: Restore tests below once we start saving GU cookie
        // it('shouldShow returns true if readGuCookie returns null', () => {
        //     readIabCookie.mockReturnValue('foo');
        //     readGuCookie.mockReturnValue(null);
        //     expect(shouldShow()).toBe(true);
        // });
        // it('shouldShow returns true if readIabCookie returns null', () => {
        //     readIabCookie.mockReturnValue(null);
        //     readGuCookie.mockReturnValue('foo');
        //     expect(shouldShow()).toBe(true);
        // });
        // it('shouldShow returns true if readIabCookie and readGuCookie return null', () => {
        //     readIabCookie.mockReturnValue(null);
        //     readGuCookie.mockReturnValue(null);
        //     expect(shouldShow()).toBe(true);
        // });
        // it('shouldShow returns false if readIabCookie and readGuCookie return truthy values', () => {
        //     readIabCookie.mockReturnValue('foo');
        //     readGuCookie.mockReturnValue('bar');
        //     expect(shouldShow()).toBe(false);
        // });
    });
});
