import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { Config } from '../types.ts';
import type {
	CheckPagesProps} from './common-functions.ts';
import {
	checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTimeAndVersion,
	checkTopAdHasLoaded,
	clickAcceptAllCookies,
	loadPage,
	log_info,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from './common-functions.ts';

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */

const checkSubsequentPage = async (context: BrowserContext, url: string, isAmp: boolean = false) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await makeNewPage(context);
	await loadPage(page, url);
	await Promise.all([checkCMPIsNotVisible(page), checkAds(page, isAmp)]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
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

	// AMP pages do not have a top ad
	if (!isAmp) {
		await checkTopAdHasLoaded(page);
	}

	await checkCMPIsOnPage(page, isAmp);
	await clickAcceptAllCookies(config, page, 'Continue', isAmp);
	await checkCMPIsNotVisible(page, isAmp);
	await reloadPage(page);
	await checkAds(page, isAmp);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

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
	log_info('checkPage (aus)');

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
