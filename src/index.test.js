/* eslint-disable no-underscore-dangle */
import waitForExpect from 'wait-for-expect';
import { CCPA as actualCCPA } from './ccpa';
import { disable, enable } from './disable';
import { TCFv2 as actualTCFv2 } from './tcfv2';
import { cmp } from '.';

const CCPA = {
	init: jest.spyOn(actualCCPA, 'init'),
	showPrivacyManager: jest.spyOn(actualCCPA, 'showPrivacyManager'),
	willShowPrivacyMessage: jest.spyOn(actualCCPA, 'willShowPrivacyMessage'),
};

const TCFv2 = {
	init: jest.spyOn(actualTCFv2, 'init'),
	showPrivacyManager: jest.spyOn(actualTCFv2, 'showPrivacyManager'),
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
		global.console.warn = jest.fn();
		cmp.init({ isInUsa: false });
		const currentVersion = window.guCmpHotFix.cmp.version;
		const mockedVersion = '4.X.X-mock';
		window.guCmpHotFix.cmp.version = mockedVersion;

		cmp.init({ isInUsa: false });

		expect(
			global.console.warn,
		).toHaveBeenCalledWith(
			'Two different versions of the CMP are running:',
			[currentVersion, mockedVersion],
		);
	});

	it.todo('uses window.guCmpHotFix instances if they exist');
});
// *************** END commercial.dcr.js hotfix ***************

describe('cmp.willShowPrivacyMessage', () => {
	it.skip('resolves regardless of when the cmp is initialised', () => {
		// This should be tested in e2e test to be meaningful
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
