import type { Browser, Page } from 'puppeteer-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkPrivacySettingsPanelIsOpen,
	checkTopAdHasLoaded,
	clearCookies,
	clearLocalStorage,
	clickRejectAllSecondLayer,
	clickSaveAndCloseSecondLayer,
	getFrame,
	loadPage,
	log_error,
	log_info,
	makeNewBrowser,
	openPrivacySettingsPanel,
	reloadPage,
} from './common-functions';

const checkTopAdDidNotLoad = async (page: Page): Promise<void> => {
	log_info(`Checking ads do not load: Start`);

	const element = await page.$(ELEMENT_ID.TOP_ADVERT);

	if (element !== null) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

const clickAcceptAllCookies = async (config: Config, page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Yes I'm Happy" on CMP`);
	const frame = getFrame(page, config.iframeDomain);
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
	log_info(`Clicked on "Yes I'm Happy" on CMP`);
};

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
	const client = await page.target().createCDPSession();
	await clearCookies(client);
	await clearLocalStorage(page);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickAcceptAllCookies(config, page);
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

	await firstLayerCheck(config, url, page, browser, nextUrl);

	await secondLayerCheck(config, url, page, browser, nextUrl);

	await browser.close();
};

export const firstLayerCheck = async function (
	config: Config,
	url: string,
	page: Page,
	browser: Browser,
	nextUrl: string,
): Promise<void> {
	// Clear cookies before starting testing, to ensure the CMP is displayed.
	const client = await page.target().createCDPSession();
	await clearCookies(client);

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
		await checkSubsequentPage(browser, config, nextUrl);
	}
	log_info('Checking first layer: Complete');
};

export const secondLayerCheck = async function (
	config: Config,
	url: string,
	page: Page,
	browser: Browser,
	nextUrl: string,
): Promise<void> {
	const client = await page.target().createCDPSession();
	await clearCookies(client);

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
	await clearCookies(client);

	await reloadPage(page);

	await checkCMPIsOnPage(page);

	await openPrivacySettingsPanel(config, page);

	await checkPrivacySettingsPanelIsOpen(config, page);

	await clickRejectAllSecondLayer(config, page);

	await checkCMPIsNotVisible(page);

	await checkTopAdDidNotLoad(page);

	log_info('Checking second layer: Complete');
};

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
