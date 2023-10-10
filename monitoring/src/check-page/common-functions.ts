import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { launchChromium } from 'playwright-aws-lambda';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';

/**
 * This function console logs an info message.
 *
 * @param {string} message
 */
export const log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};

/**
 * This function console logs an error message.
 *
 * @param {string} message
 */
export const log_error = (message: string): void => {
	console.log(`(cmp monitoring): error: ${message}`);
};

/**
 * This function will clear the cookies for a chromium client
 *
 * @param {CDPSession} client
 * @return {*}  {Promise<void>}
 */
export const clearCookies = async (page: Page): Promise<void> => {
	await page.context().clearCookies();
	log_info(`Cleared Cookies`);
};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const clearLocalStorage = async (page: Page): Promise<void> => {
	await page.evaluate(() => window.localStorage.clear());
	await page.evaluate(() => window.sessionStorage.clear());
	log_info(`Cleared LocalStorage`);
};

/**
 * This function creates a new chromium browser
 * with defined options
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
export const makeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await launchChromium({headless:debugMode});
	return browser;
};

/**
 * This function creates a new page
 * with defined options
 * @param {BrowserContext} context
 * @return {*}  {Promise<Page>}
 */
export const makeNewPage = async (context: BrowserContext): Promise<Page> => {
	const page = await context.newPage();
	await page.route('**', route => route.continue()); //disable cache to avoid 304 errors
	return page;
};

/**
 * This function waits for the page to load
 * clicks the accept all button
 *
 * @param {Config} config
 * @param {Page} page
 * @param {string} textToPrintToConsole
 */
export const clickAcceptAllCookies = async (config: Config, page: Page, textToPrintToConsole: string) => {

	log_info(`Clicking on "${textToPrintToConsole}" on CMP`);

	const acceptAllButton = page.frameLocator(ELEMENT_ID.CMP_CONTAINER).locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
  	await acceptAllButton.click();
  	//await new Promise(r => setTimeout(r, 2000)); //wait in the hope that sourcepoint has persisted the choice

	log_info(`Clicked on "${textToPrintToConsole}"`);
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
export const openPrivacySettingsPanel = async (config: Config, page: Page) => {
	log_info(`Loading privacy settings panel: Start`);

	const manageButton = page.frameLocator(ELEMENT_ID.CMP_CONTAINER).locator(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);
	await manageButton.click();
	await checkPrivacySettingsPanelIsOpen(config, page);

	log_info(`Loading privacy settings panel: Complete`);
};

/**
 * This function waits for the page to load
 * Then finds the headline on the second layer
 *
 * @param {Config} config
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkPrivacySettingsPanelIsOpen = async (
	config: Config,
	page: Page,
): Promise<void> => {

	log_info(`Waiting for Privacy Settings Panel: Start`);

	const secondLayer =  page.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]').locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	await secondLayer.waitFor();

	if (!(await secondLayer.isVisible())) {
		throw Error('Second Layer is not present on page');
	}

	log_info(`Waiting for Privacy Settings Panel: Complete`);
};

/**
 * This function gets the frame and
 * clicks the save and exit button
 *
 * @param {Config} config
 * @param {Page} page
 */
export const clickSaveAndCloseSecondLayer = async (
	config: Config,
	page: Page,
) => {
	log_info(`Clicking on save and close button: Start`);

	await page.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]').locator(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT).click();
	//await new Promise(r => setTimeout(r, 2000)); //wait in the hope that sourcepoint has persisted the choice

	log_info(`Clicking on save and exit button: Complete`);
};

/**
 * This function gets the frame on the second layer  and
 * clicks the reject all button
 *
 * @param {Config} config
 * @param {Page} page
 */
export const clickRejectAllSecondLayer = async (config: Config, page: Page) => {
	log_info(`Clicking on reject all button: Start`);

	await page.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]').locator(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL).click();
	//await new Promise(r => setTimeout(r, 2000)); //wait in the hope that sourcepoint has persisted the choice

	log_info(`Clicking on reject all button: Complete`);
};

/**
 * This function searches for the ad located at
 * the top of the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkTopAdHasLoaded = async (page: Page) => {
	log_info(`Waiting for ads to load: Start`);

	const topAds = page.locator(ELEMENT_ID.TOP_ADVERT);
  	await topAds.waitFor({state:'attached'});

	log_info(`Waiting for ads to load: Complete`);
};

/**
 * This function checks the ad is not on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkTopAdDidNotLoad = async (page: Page) => {
	log_info(`Checking ads do not load: Start`);

	const topAds = page.locator(ELEMENT_ID.TOP_ADVERT);
	const topAdsCount = await topAds.count();

	if (topAdsCount != 0) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

export const recordVersionOfCMP = async (page: Page) => {
	log_info('* Getting the version of Sourcepoint CMP');

	const functionToGetVersion = function () {
		return window._sp_.version;
	};

	log_info(await page.evaluate(functionToGetVersion));
};

/**
 * This function checks for the CMP banner on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkCMPIsOnPage = async (page: Page): Promise<void> => {
	log_info(`Waiting for CMP: Start`);

	const cmpl =  page.locator(ELEMENT_ID.CMP_CONTAINER);
	await cmpl.waitFor();
	await recordVersionOfCMP(page);
	if (!(await cmpl.isVisible())) {
		throw Error('CMP is not present on page');
	}

	log_info(`Waiting for CMP: Complete`);
};

/**
 * This function checks whether the CMP banner display is none
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkCMPIsNotVisible = async (page: Page): Promise<void> => {
	log_info(`Checking CMP is Hidden: Start`);

	const cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER);

	if (await cmpl.isVisible()) {
		throw Error('CMP still present on page');
	}

	log_info('CMP hidden or removed from page');
};


/**
 * This function loads a url onto a chromium page
 *
 * @param {Page} page
 * @param {string} url
 * @return {*}  {Promise<void>}
 */
export const loadPage = async (page: Page, url: string): Promise<void> => {
	log_info(`Loading page: Start`);
	log_info(`Loading page ${url}`);

	const response = await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});

	// If the response status code is not a 2xx success code
	if (response != null) {
		if (response.status() < 200 || response.status() > 299) {
			log_error(`Loading URL: Error: Status ${response.status()}`);
			throw 'Failed to load page!';
		}
	}

	log_info(`Loading page: Complete`);
};

/**
 * This function reloads the chromium page
 *
 * @param {Page} page
 */
export const reloadPage = async (page: Page) => {
	log_info(`Reloading page: Start`);
	const reloadResponse = await page.reload({
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});
	if (!reloadResponse) {
		log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}
	log_info(`Reloading page: Complete`);
};

/**
 * This function compares the current timestamp to a previous start time and logs
 *
 * @param {Page} page
 * @param {Metrics} startMetrics
 */
export const logCMPLoadTime = async (
	startTimeStamp: number,
	endTimeStamp: number,
	config: Config,
) => {
	log_info(`Logging Timestamp: Start`);

	const timeDiff = (endTimeStamp - startTimeStamp)/1000; //in seconds
	log_info(`CMP Loading Time: ${timeDiff}`);
	await sendMetricData(config, timeDiff);

	log_info(`Logging Timestamp: Complete`);
};

/**
 *
 *
 * @param {string} region
 * @param {number} timeToLoadInSeconds
 */
export const sendMetricData = async (
	config: Config,
	timeToLoadInSeconds: number,
) => {
	log_info(`config.platform.toUpperCase() ${config.platform.toUpperCase()})`);
	const region = config.region;
	const client = new CloudWatchClient({ region: region });
	const params = {
		MetricData: [
			{
				MetricName: 'CmpLoadingTime',
				Dimensions: [
					{
						Name: 'ApplicationName',
						Value: 'consent-management-platform',
					},
					{
						Name: 'Stage',
						Value: config.platform.toUpperCase(),
					},
				],
				Unit: 'Seconds',
				Value: timeToLoadInSeconds,
			},
		],
		Namespace: 'Application',
	};

	const command = new PutMetricDataCommand(params);

	await client.send(command);
};

/**
 * This function checks the timestamp, loads a page and checks how long it took for the CMP
 * banner to appear.
 *
 * @param {Page} page
 * @param {string} url
 */
export const checkCMPLoadingTime = async (page: Page, config: Config) => {
	if (!config.isRunningAdhoc) {
		log_info('Checking CMP Loading Time: Start')
		await Promise.all([
			clearCookies(page),
			//clearLocalStorage(page)
		]);
		const startTimeStamp = Date.now();
		await loadPage(page, config.frontUrl);
		await checkCMPIsOnPage(page); // Wait for CMP to appear
		const endTimeStamp = Date.now();
		await logCMPLoadTime(startTimeStamp, endTimeStamp, config);
		log_info('Checking CMP Loading Time: Finished')
	}
};

