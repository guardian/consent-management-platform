/**
 * @jest-environment puppeteer
 */

import 'expect-puppeteer';
import path from 'path';
import type { Browser, Frame, Page } from 'puppeteer-core';
import {
	IframeDomainUrl,
	IframeDomainUrlSecondLayer,
} from '../utils/config-builder/config-builder';
import { getFrame, makeNewBrowser } from './common-functions';

describe('common-functions.ts', () => {
	jest.setTimeout(20000);
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
			browser = await makeNewBrowser(false);
			page = await browser.newPage();
			await page.goto(staticFile);
		});

		afterAll(async () => {
			await page.close();
			await browser.close();
		});

		it('should return a 1st layer frame in code', async () => {
			const frame: Frame = await getFrame(page, firstLayerIframeDomain);
			expect(frame).toBeDefined();
		});

		it('should return a 2nd layer frame in code', async () => {
			const frame: Frame = await getFrame(page, secondLayerIframeDomain);
			expect(frame).toBeDefined();
		});

		it('should throw an error if called for a frame that does not exist', async() => {
			const iframeUrl = "error";
			await expect(getFrame(page, iframeUrl, 30)).rejects.toThrow(new Error('Could not find frame "error" : Failed'));
		  });
	});
});
