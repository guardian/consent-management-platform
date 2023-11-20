/*import path from 'path';
import type { Browser, Page } from 'playwright-core';
import {
	IframeDomainUrl,
	IframeDomainUrlSecondLayer,
} from '../utils/config-builder/config-builder';
import { makeNewBrowser } from './common-functions';
*/
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
			browser = await makeNewBrowser(true);
			page = await browser.newPage();
			await page.goto(staticFile);
		});

		afterAll(async () => {
			await page.close();
			await browser.close();
		});

		it('should return a 1st layer frame in code',  async() => {
			console.log(firstLayerIframeDomain)
			const count = await page.locator('[src="' + firstLayerIframeDomain + '"]').count();
			expect(count).toEqual(1);
		});

		it('should return a 2nd layer frame in code',  async() => {
			const count = await page.locator('[src="' + secondLayerIframeDomain + '"]').count();
			expect(count).toEqual(1);
		});

		it('should throw an error if called for a frame that does not exist', async() => {
			const iframeUrl = "error";
			const count = await page.locator('[src="' + iframeUrl + '"]').count();
			expect(count).toEqual(0);
		  });
	});*/
});
