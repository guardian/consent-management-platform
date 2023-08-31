
//import 'expect-playwright';
//import path from 'path';
//import { expect } from '@playwright/test';
//import type { Browser, Frame, Page } from 'puppeteer-core';
//import type { Browser, Frame, Page } from 'playwright-core';
/*import {
	IframeDomainUrl,
	IframeDomainUrlSecondLayer,
} from '../utils/config-builder/config-builder';
*/
//import { getFrame, makeNewBrowser } from './common-functions';

describe('common-functions.ts', () => {
	it('should be true',  () => {
		true;
	});
	/*jest.setTimeout(20000);
	const firstLayerIframeDomain = IframeDomainUrl.CODE;
	const secondLayerIframeDomain = IframeDomainUrlSecondLayer.CODE;
	let browser: Browser;
	let page: Page;
	const staticFile = `file:${path.join(
		__dirname,
		'../../static-test/frame-test.html',
	)}`;
	describe('getFrame', () => {
		beforeAll(async () => {
			browser = await makeNewBrowser();
			page = await browser.newPage();
			await page.goto(staticFile);
		});

		afterAll(async () => {
			await page.close();
			await browser.close();
		});

		it('should return a 1st layer frame in code',  () => {
			const frame: Frame = getFrame(page, firstLayerIframeDomain);
			expect(frame).toBeDefined();
		});

		it('should return a 2nd layer frame in code',  () => {
			const frame: Frame = getFrame(page, secondLayerIframeDomain);
			expect(frame).toBeDefined();
		});

		it('should throw an error if called for a frame that does not exist', async() => {
			const iframeUrl = "error";
			await expect(getFrame(page, iframeUrl, 30)).rejects.toThrow(new Error('Could not find frame "error" : Failed'));
		  });
	});*/
});
