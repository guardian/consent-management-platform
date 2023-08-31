import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	//checkCMPLoadingTime,
	checkPrivacySettingsPanelIsOpen,
	checkTopAdHasLoaded,
	clearCookies,
	clearLocalStorage,
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

	const topAds = page.locator(ELEMENT_ID.TOP_ADVERT);
	//await topAds.waitFor();
	const topAdsCount = await topAds.count();
	//expect(topAdsCount).toEqual(0);

	if (topAdsCount != 0) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

/**
 * This function waits for the page to load
 * clicks the accept all button
 *
 * @param {Config} config
 * @param {Page} page
 */
const clickAcceptAllCookies = async (config: Config, page: Page) => {

	log_info(`Clicking on "Yes I'm Happy" on CMP`);

	const acceptAllButton = page.frameLocator('[id*="sp_message_iframe"]').locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
  	await acceptAllButton.click();
  	await new Promise(r => setTimeout(r, 2000)); //wait in the hope that sourcepoint has persisted the choice

	log_info(`Clicked on "Yes I'm Happy" on CMP`);
};

/**
 * This function searches for the CMP container and throws an error
 * if it's on the page
 *
 * @param {Page} page
 */
const checkCMPDidNotLoad = async (page: Page) => {
	log_info(`Checking CMP does not load: Start`);
	try {
		await page.locator(ELEMENT_ID.CMP_CONTAINER).isVisible();
		log_error(`Checking CMP does not load: Failed`);
		throw Error('CMP present on page');
	}
	catch(error){
		log_info(`Checking CMP does not load: Complete`);
	}
  	//expect(await cmpl.isVisible()).toBeFalsy();

	//await recordVersionOfCMP(page); // needs to be called here otherwise not yet loaded.
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 *
 * @param {BrowserContext} context
 * @param {Config} config
 * @param {string} url
 */
const checkSubsequentPage = async (
	context: BrowserContext,
	config: Config,
	url: string,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await context.newPage();
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkCMPDidNotLoad(page);
	await checkTopAdHasLoaded(page);
	await Promise.all([
		clearCookies(page),
		clearLocalStorage(page)
	]);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickAcceptAllCookies(config, page);
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

	const browser: Browser = await makeNewBrowser();

	try {
		const context = await browser.newContext();
		const page = await context.newPage();

		await firstLayerCheck(config, url, page, context, nextUrl);

		await secondLayerCheck(config, url, page);

		//await checkCMPLoadingTime(page, config);

		await page.close();

	} finally {
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
	context: BrowserContext,
	nextUrl: string,
): Promise<void> {
	// Clear cookies before starting testing, to ensure the CMP is displayed.
	await clearCookies(page);

	log_info('Checking first layer: Start');

	// Testing the Accept All button hides the CMP and loads Ads
	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await checkTopAdDidNotLoad(page);

	await clickAcceptAllCookies(config, page);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	await checkCMPDidNotLoad(page);

	if (nextUrl) {
		await checkSubsequentPage(context, config, nextUrl);
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
