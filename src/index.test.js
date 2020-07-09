import { init as initCCPA } from './ccpa/sourcepoint';
import { init as initTCF } from './tcfv2/sourcepoint';
import { cmp } from '.';

jest.mock('./ccpa/sourcepoint', () => ({
	init: jest.fn(),
}));

jest.mock('./tcfv2/sourcepoint', () => ({
	init: jest.fn(),
}));

describe('cmp.init', () => {
	it('requires isInUsa to be true or false', () => {
		expect(cmp.init).toThrow();
	});

	it('initializes CCPA when in the US', () => {
		cmp.init({ isInUsa: true });
		expect(initCCPA).toHaveBeenCalledTimes(1);
	});

	it('initializes TCF when not in the US', () => {
		cmp.init({ isInUsa: false });
		expect(initTCF).toHaveBeenCalledTimes(1);
	});
});

describe('cmp.willShowPrivacyMessage', () => {
	it('resolves regardless of when the cmp is initialised', () => {
		fail('no test');
	});
});

describe('cmp.showPrivacyManager', () => {
	it('shows the privacy manager when called', () => {
		fail('no test');
	});
});
