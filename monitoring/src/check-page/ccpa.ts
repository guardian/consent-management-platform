import type { Browser, BrowserContext, Page } from 'playwright-core';
import { ELEMENT_ID } from '../types';
import type { Config } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTime,
	checkTopAdHasLoaded,
	loadPage,
	log_info,
	makeNewBrowser,
	makeNewPage,
	reloadPage,
} from './common-functions';

const clickDoNotSellMyInfo = async (config: Config, page: Page) => {

	log_info(`Clicking on "Do not sell my personal information" on CMP`);

	const acceptAllButton = page.frameLocator(ELEMENT_ID.CMP_CONTAINER).locator(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);
  	await acceptAllButton.click();

	log_info(`Clicked on "Do not sell my personal information" on CMP`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */
const checkSubsequentPage = async (context: BrowserContext, url: string) => {
	log_info(`Checking subsequent Page URL: ${url} Start`);
	const page: Page = await makeNewPage(context);
	await loadPage(page, url);
	await Promise.all([
		checkCMPIsNotVisible(page),
		checkTopAdHasLoaded(page),
	]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
};
const setGPCHeader = async (page: Page, gpcHeader: boolean): Promise<void> => {
	await page.setExtraHTTPHeaders({
		'Sec-GPC': gpcHeader ? '1' : '0',
	});
};
const checkBannerIsNotVisibleAfterSettingGPCHeader = async (page: Page) => {
	log_info(`Check Banner Is Not Visible After Setting GPC Header: Start`);

	await setGPCHeader(page, true);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);

	log_info(
		`Check Banner Is Not Visible After Setting GPC Header : Completed`,
	);
};

const checkGPCRespected = async (page: Page) => {
	await checkBannerIsNotVisibleAfterSettingGPCHeader(page);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (config: Config, url: string, nextUrl: string) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(config.debugMode);
	const context = await browser.newContext();
	const page = await makeNewPage(context);

	await loadPage(page, url);
	await checkTopAdHasLoaded(page);
	await checkCMPIsOnPage(page);
	await clickDoNotSellMyInfo(config, page);
	await checkCMPIsNotVisible(page);
	await reloadPage(page);
	await checkTopAdHasLoaded(page);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

	await checkGPCRespected(page);

	// Clear GPC header before loading CMP banner as previous tests hides the banner.
	//await setGPCHeader(page, false); --> not required if using new browser below as a new browser is cleared

	await page.close();
	await browser.close();

	//instead of clearing cookies and local storage, use a new browser and context, just using a new context did not work on lambda
	const browserForCMPLoadTime: Browser = await makeNewBrowser(config.debugMode);
	const contextForCMPLoadTime = await browserForCMPLoadTime.newContext();
	const pageForCMPLoadTime = await makeNewPage(contextForCMPLoadTime);
	await checkCMPLoadingTime(pageForCMPLoadTime, config);

	await pageForCMPLoadTime.close();
	await browserForCMPLoadTime.close();
};

export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (ccpa)');
	await checkPages(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
	);
	await checkPages(config, `${config.articleUrl}?adtest=fixed-puppies`, '');

};
