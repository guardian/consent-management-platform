/* eslint-disable no-underscore-dangle */
import waitForExpect from 'wait-for-expect';
import { AUS as actualAUS } from './aus';
import { CCPA as actualCCPA } from './ccpa';
import { disable, enable } from './disable';
import { getCurrentFramework } from './getCurrentFramework';
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

const AUS = {
	init: jest.spyOn(actualAUS, 'init'),
	showPrivacyManager: jest.spyOn(actualAUS, 'showPrivacyManager'),
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

		cmp.init({ country: 'GB' });
		cmp.init({ country: 'US' });

		expect(TCFv2.init).not.toHaveBeenCalled();
		expect(CCPA.init).not.toHaveBeenCalled();

		enable();
	});

	it('requires country to be set', () => {
		expect(() => {
			cmp.init({ pubData: {} });
		}).toThrow('required');
	});

	it('initializes CCPA when in the US', () => {
		cmp.init({ country: 'US' });
		expect(CCPA.init).toHaveBeenCalledTimes(1);
	});

	it('initializes CCPA when in Australia', () => {
		cmp.init({ country: 'AU' });
		expect(AUS.init).toHaveBeenCalledTimes(1);
	});

	it('initializes TCF when neither in the US or Australia', () => {
		cmp.init({ country: 'GB' });
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
	});
});

// *************** START commercial.dcr.js hotfix ***************
describe('hotfix cmp.init', () => {
	it('only initialises once per page', () => {
		cmp.init({ country: 'GB' });
		cmp.init({ country: 'GB' });
		cmp.init({ country: 'GB' });
		cmp.init({ country: 'GB' });
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
		expect(window.guCmpHotFix.initialised).toBe(true);
	});

	it('warn if two versions are running simultaneously', () => {
		global.console.warn = jest.fn();
		cmp.init({ country: 'GB' });
		const currentVersion = window.guCmpHotFix.cmp.version;
		const mockedVersion = 'X.X.X-mock';
		window.guCmpHotFix.cmp.version = mockedVersion;

		cmp.init({ country: 'GB' });

		expect(
			global.console.warn,
		).toHaveBeenCalledWith(
			'Two different versions of the CMP are running:',
			[currentVersion, mockedVersion],
		);
	});

	it.each([
		['GB', 'tcfv2'],
		['AU', 'aus'],
		['US', 'ccpa'],
		['YT', 'tcfv2'],
		['FR', 'tcfv2'],
		['CA', 'tcfv2'],
		['NZ', 'tcfv2'],
	])('In %s, use the %s framework correctly', (country, framework) => {
		cmp.init({ country });
		expect(getCurrentFramework()).toEqual(framework);
	});

	it.todo('uses window.guCmpHotFix instances if they exist');
});
// *************** END commercial.dcr.js hotfix ***************

describe('cmp.willShowPrivacyMessage', () => {
	it.skip('resolves regardless of when the cmp is initialised', () => {
		// This should be tested in e2e test to be meaningful
		const willShowPrivacyMessage1 = cmp.willShowPrivacyMessage();

		cmp.init({ country: 'US' });

		const willShowPrivacyMessage2 = cmp.willShowPrivacyMessage();

		return expect(
			Promise.all([willShowPrivacyMessage1, willShowPrivacyMessage2]),
		).resolves.toEqual(['iwillshowit', 'iwillshowit']);
	});
});

describe('cmp.showPrivacyManager', () => {
	it('shows CCPA privacy manager when in the US', () => {
		cmp.init({ country: 'US' });

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(CCPA.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});

	it('shows AUS privacy manager when in Australia', () => {
		cmp.init({ country: 'AU' });

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(AUS.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
	it('shows TCF privacy manager when neither in the US or Australia', () => {
		cmp.init({ country: 'GB' });

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(TCFv2.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
});

it.todo('cmp.willShowPrivacyMessage');

describe('Old API parameter `isInUsa`', () => {
	it('Should handle `{ isInUsa: true }`', () => {
		cmp.init({ isInUsa: true });
		expect(CCPA.init).toHaveBeenCalledTimes(1);
	});

	it('Should handle `{ isInUsa: false }`', () => {
		cmp.init({ isInUsa: false });
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
	});

	it('Should throw an error if neither is passed', () => {
		expect(() => {
			cmp.init({});
		}).toThrow('required');
	});
});
