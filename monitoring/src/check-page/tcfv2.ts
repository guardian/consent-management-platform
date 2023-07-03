import type { Browser, Page } from 'puppeteer-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkCMPLoadingTime,
	checkPrivacySettingsPanelIsOpen,
	checkTopAdHasLoaded,
	clearCookies,
	clearLocalStorage,
	clickAcceptAllCookies,
	clickRejectAllSecondLayer,
	clickSaveAndCloseSecondLayer,
	loadPage,
	log_error,
	log_info,
	makeNewBrowser,
	openPrivacySettingsPanel,
	reloadPage,
} from './common-functions';

/**
 * This function checks the ad is not on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
const checkTopAdDidNotLoad = async (page: Page): Promise<void> => {
	log_info(`Checking ads do not load: Start`);

	const element = await page.$(ELEMENT_ID.TOP_ADVERT);

	if (element !== null) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

/**
 * This function searches for the CMP container and throws an error
 * if it's on the page
 *
 * @param {Page} page
 */
const checkCMPDidNotLoad = async (page: Page) => {
	log_info(`Checking CMP does not load: Start`);

	const spMessageContainer = await page.$(ELEMENT_ID.CMP_CONTAINER);

	if (spMessageContainer !== null) {
		log_error(`Checking CMP does not load: Failed`);
		throw Error('CMP present on page');
	}

	log_info(`Checking CMP does not load: Complete`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 *
 * @param {Browser} browser
 * @param {Config} config
 * @param {string} url
 */
const checkSubsequentPage = async (
	browser: Browser,
	config: Config,
	url: string,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkTopAdHasLoaded(page);
	await Promise.all([
		clearCookies(page),
		clearLocalStorage(page)
	]);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickAcceptAllCookies(config, page, `Yes I'm Happy`);
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

/**
 * Creates a browser and page.
 * Performs the tests for each layer.
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 */
const checkPages = async (config: Config, url: string, nextUrl: string) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(config.debugMode);

	try {
		const page: Page = await browser.newPage();

		await firstLayerCheck(config, url, page, browser, nextUrl);

		await secondLayerCheck(config, url, page);

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

/**
 *
 * This function performs a series of tests to check
 * the first panel.
 *
 * @param {Config} config
 * @param {string} url
 * @param {Page} page
 * @param {Browser} browser
 * @param {string} nextUrl
 * @return {*}  {Promise<void>}
 */
export const firstLayerCheck = async function (
	config: Config,
	url: string,
	page: Page,
	browser: Browser,
	nextUrl: string,
): Promise<void> {
	// Clear cookies before starting testing, to ensure the CMP is displayed.
	await clearCookies(page);

	log_info('Checking first layer: Start');

	// Testing the Accept All button hides the CMP and loads Ads
	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await checkTopAdDidNotLoad(page);

	await clickAcceptAllCookies(config, page, `Yes I'm Happy`);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	await checkCMPDidNotLoad(page);

	if (nextUrl) {
		try{
			await checkSubsequentPage(browser, config, nextUrl);
		}
		catch(e){
			if (e instanceof Error) console.error(`Failed to checkSubsequentPage. Trying once again.\n${e.message}`)
			else console.error(`Failed to checkSubsequentPage. Trying once again.`);
			await checkSubsequentPage(browser, config, nextUrl);
		}
	}
	log_info('Checking first layer: Complete');
};

/**
 * This function performs a series of tests to check
 * the privacy settings panel.
 *
 * @param {Config} config
 * @param {string} url
 * @param {Page} page
 * @param {Browser} browser
 * @param {string} nextUrl
 * @return {*}  {Promise<void>}
 */
export const secondLayerCheck = async function (
	config: Config,
	url: string,
	page: Page,
	// browser: Browser,
	// nextUrl: string,
): Promise<void> {
	await clearCookies(page);
	await clearLocalStorage(page);

	log_info('Checking second layer: Start');

	// Testing the Save and Close button hides the CMP and does not load Ads
	// Accepting default consent state (Essential only)
	log_info('Starting Save and Close check');

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await openPrivacySettingsPanel(config, page);

	await checkPrivacySettingsPanelIsOpen(config, page);

	await clickSaveAndCloseSecondLayer(config, page);

	await checkCMPIsNotVisible(page);

	await checkTopAdDidNotLoad(page);

	log_info('Starting Reject All check');
	// Testing the Reject All button hides the CMP and does not load Ads
	await clearCookies(page);
	await clearLocalStorage(page);

	await reloadPage(page);

	await checkCMPIsOnPage(page);

	await openPrivacySettingsPanel(config, page);

	await checkPrivacySettingsPanelIsOpen(config, page);

	await clickRejectAllSecondLayer(config, page);

	await checkCMPIsNotVisible(page);

	await checkTopAdDidNotLoad(page);

	log_info('Checking second layer: Complete');
};

/**
 * This is the function tests the page for two different scenarios:
 * 1. A user visits the home page (uses the frontend repo) and navigates
 * to an article page (uses dotcom-rendering)
 * 2. A user visit only the article page
 *
 * @param {Config} config
 * @return {*}  {Promise<void>}
 */
export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (tcfv2)');
	// Testing the user first visits home page then an article page
	await checkPages(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
	);

	// Testing the user first visits only an article page
	await checkPages(config, `${config.articleUrl}?adtest=fixed-puppies`, '');
};
