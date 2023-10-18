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

const clickAcceptAllCookies = async (config: Config, page: Page) => {
	log_info(`Clicking on "Continue" on CMP`);

	const frame = await getFrame(page, config.iframeDomain);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);

	log_info(`Clicked on "Continue" on CMP`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */

const checkSubsequentPage = async (browser: Browser, url: string) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	await Promise.all([
		checkCMPIsNotVisible(page),
		checkTopAdHasLoaded(page),
	]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (config: Config, url: string, nextUrl: string) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(config.debugMode);

	try {
		const page: Page = await browser.newPage();

		// Clear cookies before starting testing, to ensure the CMP is displayed.
		await clearCookies(await page.target().createCDPSession());
		await loadPage(page, url);
		await checkTopAdHasLoaded(page);
		await checkCMPIsOnPage(page);
		await clickAcceptAllCookies(config, page);
		await checkCMPIsNotVisible(page);
		await reloadPage(page);
		await checkTopAdHasLoaded(page);

		if (nextUrl) {
			await checkSubsequentPage(browser, nextUrl);
		}

		await checkCMPLoadingTime(page, config);

		await page.close();

	} finally {
		const pages = await browser.pages();
		for (const page of pages) {
			await page.close();
		}
		await browser.close();
	}
};

export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (aus)');
	await checkPages(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
	);
	await checkPages(config, `${config.articleUrl}?adtest=fixed-puppies`, '');
};
