import * as libs from '@guardian/libs';
import waitForExpect from 'wait-for-expect';
import { AUS as actualAUS } from './aus';
import { CCPA as actualCCPA } from './ccpa';
import { disable, enable } from './disable';
import { getCurrentFramework } from './getCurrentFramework';
import { TCFv2 as actualTCFv2 } from './tcfv2';
import { cmp } from '.';

const getLocale = jest.spyOn(libs, 'getLocale');
getLocale.mockImplementation(async () => 'GB');

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

afterAll(() => {
	getLocale.mockClear();
});

describe('cmp.init', () => {
	it('does nothing if CMP is disabled', async () => {
		disable();

		await cmp.init();
		await cmp.init();

		expect(TCFv2.init).not.toHaveBeenCalled();
		expect(CCPA.init).not.toHaveBeenCalled();

		enable();
	});

	it('initializes CCPA when in the US', async () => {
		getLocale.mockImplementationOnce(async () => 'US');
		await cmp.init();
		expect(CCPA.init).toHaveBeenCalledTimes(1);
	});

	it('initializes CCPA when in Australia', async () => {
		getLocale.mockImplementationOnce(async () => 'AU');
		await cmp.init();
		expect(AUS.init).toHaveBeenCalledTimes(1);
	});

	it('initializes TCF when neither in the US or Australia', async () => {
		getLocale.mockImplementationOnce(async () => 'ZA');
		await cmp.init();
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
	});
});

// *************** START commercial.dcr.js hotfix ***************
describe('hotfix cmp.init', () => {
	it('only initialises once per page', async () => {
		await cmp.init();
		await cmp.init();
		await cmp.init();
		await cmp.init();
		expect(TCFv2.init).toHaveBeenCalledTimes(1);
		expect(window.guCmpHotFix.initialised).toBe(true);
	});

	it('warn if two versions are running simultaneously', async () => {
		global.console.warn = jest.fn();
		await cmp.init();
		const currentVersion = window.guCmpHotFix.cmp.version;
		const mockedVersion = 'X.X.X-mock';
		global.guCmpHotFix.cmp.version = mockedVersion;

		await cmp.init();

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
	])('In %s, use the %s framework correctly', async (country, framework) => {
		getLocale.mockImplementationOnce(async () => country);
		await cmp.init();
		expect(getCurrentFramework()).toEqual(framework);
	});

	it.todo('uses window.guCmpHotFix instances if they exist');
});
// *************** END commercial.dcr.js hotfix ***************

describe('cmp.willShowPrivacyMessage', () => {
	it.skip('resolves regardless of when the cmp is initialised', async () => {
		// This should be tested in e2e test to be meaningful
		const willShowPrivacyMessage1 = cmp.willShowPrivacyMessage();

		await cmp.init();

		const willShowPrivacyMessage2 = cmp.willShowPrivacyMessage();

		return expect(
			Promise.all([willShowPrivacyMessage1, willShowPrivacyMessage2]),
		).resolves.toEqual(['iwillshowit', 'iwillshowit']);
	});
});

describe('cmp.showPrivacyManager', () => {
	it('shows CCPA privacy manager when in the US', async () => {
		getLocale.mockImplementationOnce(async () => 'US');
		await cmp.init();

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(CCPA.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});

	it('shows AUS privacy manager when in Australia', async () => {
		getLocale.mockImplementationOnce(async () => 'AU');
		await cmp.init();

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(AUS.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
	it('shows TCF privacy manager when neither in the US or Australia', async () => {
		getLocale.mockImplementationOnce(async () => 'ZA');
		await cmp.init();

		cmp.showPrivacyManager();

		return waitForExpect(() =>
			expect(TCFv2.showPrivacyManager).toHaveBeenCalledTimes(1),
		);
	});
});

it.todo('cmp.willShowPrivacyMessage');
