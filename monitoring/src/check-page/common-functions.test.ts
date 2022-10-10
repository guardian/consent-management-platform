/**
 * @jest-environment puppeteer
 */

import 'expect-puppeteer';
import type { Browser, Frame, Page } from 'puppeteer-core';
import {
	ConfigFrontUrl,
	IframeDomainUrl,
} from '../utils/config-builder/config-builder';
import { getFrame, makeNewBrowser } from './common-functions';

describe('common-functions.ts', () => {
	jest.setTimeout(20000);
	const frontUrl = ConfigFrontUrl.CODE;
	let iframeDomainUrl = IframeDomainUrl.CODE;
	let page: Page;
	describe('getFrame', () => {
		beforeAll(async () => {
			const browser: Browser = await makeNewBrowser(false);
			page = await browser.newPage();
			await page.goto(frontUrl);
		});

		it('should return a frame', () => {
			const frame: Frame | undefined = getFrame(page, iframeDomainUrl);
			expect(frame).toBeDefined();
		});

		it('should return an undefined if iframe url passed does not exist', () => {
			iframeDomainUrl = IframeDomainUrl.PROD;
			const frame: Frame | undefined = getFrame(page, iframeDomainUrl);
			expect(frame).toBeUndefined();
		});
	});
});
