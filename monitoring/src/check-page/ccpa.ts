import type { Browser, Page } from 'puppeteer-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTime,
	checkTopAdHasLoaded,
	clearCookies,
	getFrame,
	loadPage,
	log_info,
	makeNewBrowser,
	reloadPage,
} from './common-functions';

const clickDoNotSellMyInfo = async (config: Config, page: Page) => {

	log_info(`Clicking on "Do not sell my personal information" on CMP`);

	const frame = await page.waitForFrame( f => f.url().startsWith(config.iframeDomain));
	await frame.waitForSelector(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);
	await frame.click(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);

	config.iframeDomain
	log_info(`Clicked on "Do not sell my personal information" on CMP`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */
const checkSubsequentPage = async (browser: Browser, url: string) => {
	log_info(`Checking subsequent Page URL: ${url} Start`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	await checkCMPIsNotVisible(page);
	await checkTopAdHasLoaded(page);
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

/**
 * This function should be used within page.evaluate
 * Not currently using this as not working consistently
 * @return {*}
 */
// const invokeUspApi = () => {
// 	return new Promise<UspData>((resolve) => {
// 		const uspApiCallback = (uspData: UspData) => {
// 			resolve(uspData);
// 		};

// 		if (typeof window.__uspapi === 'function') {
// 			window.__uspapi('getUSPData', 1, uspApiCallback);
// 		}
// 	});
// };

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
	const page: Page = await browser.newPage();

	// Clear cookies before starting testing, to ensure the CMP is displayed.
	const client = await page.target().createCDPSession();
	await clearCookies(client);

	await loadPage(page, url);

	await checkTopAdHasLoaded(page);

	await checkCMPIsOnPage(page);

	await clickDoNotSellMyInfo(config, page);

	await checkCMPIsNotVisible(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	if (nextUrl) {
		await checkSubsequentPage(browser, nextUrl);
	}

	await checkGPCRespected(page);

	// Clear GPC header before loading CMP banner as previous tests hides the banner.
	await setGPCHeader(page, false);

	await checkCMPLoadingTime(page, config);

	await page.close();

	const pages = await browser.pages();
	for (const page of pages) {
		await page.close();
	}
	await browser.close();
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
