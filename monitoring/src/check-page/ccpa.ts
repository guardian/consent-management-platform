import type { Browser, Page } from 'puppeteer-core';
import type { Config, UspData } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdHasLoaded,
	clearCookies,
	getFrame,
	loadPage,
	log_info,
	makeNewBrowser,
	reloadPage,
} from './common-functions';

const clickDoNotSellMyInfo = async (config: Config, page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Do not sell my personal information" on CMP`);
	const frame = getFrame(page, config.iframeDomain);
	await frame.click(ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON);
	log_info(`Clicked on "Do not sell my personal information" on CMP`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */
const checkSubsequentPage = async (browser: Browser, url: string) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	await checkCMPIsNotVisible(page);
	await checkTopAdHasLoaded(page);
};
const setGPCHeader = async (page: Page, gpcHeader: boolean): Promise<void> => {
	await page.setExtraHTTPHeaders({
		'Sec-GPC': gpcHeader ? '1' : '0',
	});
};
const checkBannerIsNotVisibleAfterSettingGPCHeaderToTrue = async (
	page: Page,
	url: string,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	log_info(`GPC signal: Start`);

	await setGPCHeader(page, true);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);

	log_info(`GPC signal respected : Completed`);
};

/**
 * This function should be used within page.evaluate
 *
 * @return {*}
 */
const invokeUspApi = () => {
	return new Promise<UspData>((resolve) => {
		const uspApiCallback = (uspData: UspData) => {
			resolve(uspData);
		};

		if (typeof window.__uspapi === 'function') {
			window.__uspapi('getUSPData', 1, uspApiCallback);
		}
	});
};

const checkBannerIsVisibleAfterSettingGPCHeaderToFalse = async (
	page: Page,
	url: string,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	log_info(`GPC Header is set to false: Start`);

	await setGPCHeader(page, false);

	await reloadPage(page);

	await checkCMPIsOnPage(page);

	await checkTopAdHasLoaded(page);

	log_info(`GPC Header is set to false: Completed`);
};

const checkGPCRespected = async (page: Page, url: string) => {
	await checkBannerIsVisibleAfterSettingGPCHeaderToFalse(page, url);
	await checkBannerIsNotVisibleAfterSettingGPCHeaderToTrue(page, url);
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

	await checkGPCRespected(page, url);

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
