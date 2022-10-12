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
	//const frontUrl = ConfigFrontUrl.CODE;
	const iframeDomainUrl = IframeDomainUrl.CODE;
	let page: Page;
	let browser: Browser;
	describe('getFrame', () => {
		beforeAll(async () => {
			browser = await makeNewBrowser(false);
			page = await browser.newPage();
			await page.goto(iframeDomainUrl);
		});

		afterAll(async () => {
			await page.close();
			await browser.close();
		});

		it('should return a frame', () => {
			const frame: Frame = getFrame(page, iframeDomainUrl);
			expect(frame).toBeDefined();
		});
	});
});
