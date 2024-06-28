import type { Browser, BrowserContext, Page } from 'playwright-core';
import { ELEMENT_ID } from '../types';
import type { Config } from '../types';
import type {
	CheckPagesProps} from './common-functions';
import {
	checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTimeAndVersion,
	checkTopAdHasLoaded,
	loadPage,
	log_info,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from './common-functions';

const clickDoNotSellMyInfo = async (
	config: Config,
	page: Page,
	isAmp: boolean = false,
) => {
	log_info(`Clicking on "Do not sell my personal information" on CMP`);
	let acceptAllButton;
	if (isAmp) {
		acceptAllButton = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);
	} else {
		acceptAllButton = page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);
	}

	await acceptAllButton.click();

	log_info(`Clicked on "Do not sell my personal information" on CMP`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */
const checkSubsequentPage = async (
	context: BrowserContext,
	url: string,
	isAmp: boolean = false,
) => {
	log_info(`Checking subsequent Page URL: ${url} Start`);
	const page: Page = await makeNewPage(context);
	await loadPage(page, url);
	await Promise.all([
		checkCMPIsNotVisible(page, isAmp),
		checkAds(page, isAmp),
	]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
};
const setGPCHeader = async (page: Page, gpcHeader: boolean): Promise<void> => {
	await page.setExtraHTTPHeaders({
		'Sec-GPC': gpcHeader ? '1' : '0',
	});
};

const checkBannerIsNotVisibleAfterSettingGPCHeader = async (
	page: Page,
	isAmp: boolean = false,
) => {
	log_info(`Check Banner Is Not Visible After Setting GPC Header: Start`);

	await setGPCHeader(page, true);

	await reloadPage(page);

	await checkCMPIsNotVisible(page, isAmp);

	await checkAds(page, isAmp);

	log_info(
		`Check Banner Is Not Visible After Setting GPC Header : Completed`,
	);
};

const checkGPCRespected = async (page: Page, isAmp: boolean = false) => {
	await checkBannerIsNotVisibleAfterSettingGPCHeader(page, isAmp);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async ({config, url, nextUrl,isAmp}: CheckPagesProps) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(config.debugMode);
	const context = await makeNewContext(browser, isAmp);
	const page = await makeNewPage(context);

	await loadPage(page, url);

	if(!isAmp){
		await checkTopAdHasLoaded(page);
	}

	await checkCMPIsOnPage(page, isAmp);
	await clickDoNotSellMyInfo(config, page, isAmp);
	await checkCMPIsNotVisible(page, isAmp);

	await checkAds(page, isAmp);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl, isAmp);
	}

	await checkGPCRespected(page, isAmp);

	// Clear GPC header before loading CMP banner as previous tests hides the banner.
	//await setGPCHeader(page, false); --> not required if using new browser below as a new browser is cleared

	await page.close();
	await browser.close();

	//instead of clearing cookies and local storage, use a new browser and context, just using a new context did not work on lambda
	const browserForCMPLoadTime: Browser = await makeNewBrowser(
		config.debugMode,
	);
	const contextForCMPLoadTime = await makeNewContext(browserForCMPLoadTime, isAmp);
	const pageForCMPLoadTime = await makeNewPage(contextForCMPLoadTime);
	await checkCMPLoadingTimeAndVersion(pageForCMPLoadTime, config);

	await pageForCMPLoadTime.close();
	await browserForCMPLoadTime.close();
};

export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (ccpa)');

	// Check the front page and subsequent article page
	await checkPages({
		config,
		url: `${config.frontUrl}?adtest=fixed-puppies`,
		nextUrl: `${config.articleUrl}?adtest=fixed-puppies`,
		isAmp: false,
	})

	// Check the article page
	await checkPages({
		config,
		url: `${config.articleUrl}?adtest=fixed-puppies`,
		isAmp: false,
	})

	// Check the AMP article page
	await checkPages({
		config,
		url: `${config.ampArticle}?adtest=fixed-puppies`,
		isAmp: true,
	})
};
