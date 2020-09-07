/* eslint-disable no-underscore-dangle */
import waitForExpect from 'wait-for-expect';
import { CCPA } from './ccpa';
import { disable, enable } from './disable';
import { TCFv2 as actualTCFv2 } from './tcfv2';
import { cmp } from '.';

jest.mock('./ccpa', () => ({
	CCPA: {
		init: jest.fn(),
		showPrivacyManager: jest.fn(),
		willShowPrivacyMessage: () => Promise.resolve('iwillshowit'),
	},
}));

const TCFv2 = {
	init: jest.spyOn(actualTCFv2, 'init'),
	showPrivacyManager: jest.spyOn(actualTCFv2, 'showPrivacyManager'),
	willShowPrivacyMessage: jest.spyOn(actualTCFv2, 'willShowPrivacyMessage'),
};

beforeEach(() => {
	window._sp_ = undefined;
	window._sp_ccpa = undefined;
	window.guCmpHotFix.initialised = false;
	TCFv2.init.mockClear();
	CCPA.init.mockClear();
});

describe('cmp.init', () => {
	it('does nothing if CMP is disabled', () => {
		disable();

		cmp.init({ isInUsa: false });
		cmp.init({ isInUsa: true });

		expect(TCFv2.init).not.toHaveBeenCalled();
		expect(CCPA.init).not.toHaveBeenCalled();

		enable();
	});

	it('requires isInUsa to be true or false', () => {
		expect(() => {
			cmp.init({ pubData: {} });
		}).toThrow('required');
	});

	it('initializes CCPA when in the US', () => {
		cmp.init({ isInUsa: true });
		expect(CCPA.init).toHaveBeenCalledTimes(1);
	});

	it('initializes TCF when not in the US', () => {
		cmp.init({ isInUsa: false });
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
	});
});

// *************** START commercial.dcr.js hotfix ***************
describe('hotfix cmp.init', () => {
	it('only initialises once per page', () => {
		cmp.init({ isInUsa: false });
		cmp.init({ isInUsa: false });
		cmp.init({ isInUsa: false });
		cmp.init({ isInUsa: false });
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
		expect(window.guCmpHotFix.initialised).toBe(true);
	});

	it('warn if two versions are running simultaneously', () => {
		const spy = jest.spyOn(global.console, 'warn');
		cmp.init({ isInUsa: false });
		const cmpVersion = [window.guCmpHotFix.cmp.version, 'mockedVersion'];
		// eslint-disable-next-line prefer-destructuring
		window.guCmpHotFix.cmp.version = cmpVersion[1];

		cmp.init({ isInUsa: false });

		expect(spy).toHaveBeenCalledWith(
			'Two different versions of the CMP are running:',
			cmpVersion,
		);
	});

	it.todo('uses window.guCmpHotFix instances if they exist');
});
// *************** END commercial.dcr.js hotfix ***************

describe('cmp.willShowPrivacyMessage', () => {
	it('resolves regardless of when the cmp is initialised', () => {
		const willShowPrivacyMessage1 = cmp.willShowPrivacyMessage();

		cmp.init({ isInUsa: true });

		const willShowPrivacyMessage2 = cmp.willShowPrivacyMessage();

		return expect(
			Promise.all([willShowPrivacyMessage1, willShowPrivacyMessage2]),
		).resolves.toEqual(['iwillshowit', 'iwillshowit']);
	});
});

describe('cmp.showPrivacyManager', () => {
	it('shows CCPA privacy manager when in the US', () => {
		cmp.init({ isInUsa: true });

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(CCPA.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
	it('shows TCF privacy manager when not in the US', () => {
		cmp.init({ isInUsa: false });

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(TCFv2.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
});
