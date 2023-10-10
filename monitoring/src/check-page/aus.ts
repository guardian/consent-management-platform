import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { Config } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTime,
	checkTopAdHasLoaded,
	clearCookies,
	clickAcceptAllCookies,
	loadPage,
	log_info,
	makeNewBrowser,
	makeNewPage,
	reloadPage,
} from './common-functions';

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */

const checkSubsequentPage = async (context: BrowserContext, url: string) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await makeNewPage(context);
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
	const context = await browser.newContext();
	const page = await makeNewPage(context);

	// Clear cookies before starting testing, to ensure the CMP is displayed.
	await clearCookies(page);

	await loadPage(page, url);
	await checkTopAdHasLoaded(page);
	await checkCMPIsOnPage(page);
	await clickAcceptAllCookies(config, page, 'Continue');
	await checkCMPIsNotVisible(page);
	await reloadPage(page);
	await checkTopAdHasLoaded(page);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

	await page.close();
	await browser.close();

	//Use a new Browser here as clearing cookies and local storage here hang flakily
	const browser2: Browser = await makeNewBrowser(config.debugMode);
	const context2 = await browser2.newContext();
	const page2 = await makeNewPage(context2);
	await checkCMPLoadingTime(page2, config);

	await page2.close();
	await browser2.close();
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

