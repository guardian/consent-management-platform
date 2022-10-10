import type { Browser, Page } from 'puppeteer-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdHasLoaded,
	clearCookies,
	getFrame,
	loadPage,
	log_error,
	log_info,
	makeNewBrowser,
} from './common-functions';

const clickAcceptAllCookies = async (config: Config, page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Continue" on CMP`);

	const frame = getFrame(page, config.iframeDomain);
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);

	log_info(`Clicked on "Continue" on CMP`);
};

const reloadPage = async (page: Page) => {
	log_info(`Reloading page: Start`);
	const reloadResponse = await page.reload({
		waitUntil: ['networkidle0', 'domcontentloaded'],
		timeout: 30000,
	});
	if (!reloadResponse) {
		log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}
	log_info(`Reloading page: Complete`);
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

	await clickAcceptAllCookies(config, page);

	await checkCMPIsNotVisible(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	if (nextUrl) {
		await checkSubsequentPage(browser, nextUrl);
	}

	await browser.close();
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
