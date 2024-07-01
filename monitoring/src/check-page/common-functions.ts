import type { PutMetricDataCommandInput } from '@aws-sdk/client-cloudwatch';
import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { launchChromium } from 'playwright-aws-lambda';
import type { Browser, BrowserContext, Page, Request } from 'playwright-core';
import type { Config } from '../types';
import { ELEMENT_ID } from '../types';

/**
 * Represents the props for the checkPages.
 */
export interface CheckPagesProps{
	config: Config;
	url: string;
	nextUrl?: string;
	isAmp?: boolean;
}
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
	console.error(`(cmp monitoring): error: ${message}`);
};

export const ScreenDimensions = {
	WEB: { width: 1280, height: 720 },
	MOBILE: { width: 430, height: 932 },
};

/**
 * This function will clear the cookies for a chromium client
 *
 * @param {CDPSession} client
 * @return {*}  {Promise<void>}
 */
export const clearCookies = async (page: Page): Promise<void> => {
	const cookies = await page.context().cookies();

	for(const cookie of cookies) {
		await page.context().clearCookies(cookie);
	}

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
 *
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
export const makeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await launchChromium({ headless: !debugMode });
	return browser;
};

/**
 * Creates a new browser context with the specified viewport dimensions.
 * @param browser - The browser instance.
 * @param isAmp - Indicates whether the context is for an AMP page. Default is false.
 * @returns A promise that resolves to the newly created browser context.
 */
export const makeNewContext = async (browser: Browser, isAmp: boolean = false): Promise<BrowserContext> => {
	return await browser.newContext({ viewport: !isAmp ? ScreenDimensions.WEB : ScreenDimensions.MOBILE });
}

/**
 * This function creates a new page
 *
 * @param {BrowserContext} context
 * @return {*}  {Promise<Page>}
 */
export const makeNewPage = async (context: BrowserContext): Promise<Page> => {
	const page = await context.newPage();
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
export const clickAcceptAllCookies = async (
	config: Config,
	page: Page,
	textToPrintToConsole: string,
	isAmp: boolean = false,
) => {
	log_info(`Clicking on "${textToPrintToConsole}" on CMP`);
	let acceptAllButton;
	if (isAmp) {
		acceptAllButton = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
	} else {
		acceptAllButton = page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
	}

	await acceptAllButton.click();

	log_info(`Clicked on "${textToPrintToConsole}"`);
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
export const openPrivacySettingsPanel = async (
	config: Config,
	page: Page,
	isAmp: boolean = false,
) => {
	log_info(`Loading privacy settings panel: Start`);
	let manageButton;
	if (isAmp) {
		manageButton = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);
	} else {
		manageButton = page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);
	}

	await manageButton.click();
	await checkPrivacySettingsPanelIsOpen(config, page, isAmp);

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
	isAmp: boolean = false,
): Promise<void> => {
	log_info(`Waiting for Privacy Settings Panel: Start`);
	let secondLayer;

	if (isAmp) {
		secondLayer = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER).last()
			.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	} else {
		secondLayer = page
			.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]')
			.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	}

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
	isAmp: boolean = true
) => {
	log_info(`Clicking on save and close button: Start`);
	let saveAndExitButton;
	if(isAmp) {
		saveAndExitButton = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER).last()
			.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);
	} else {
		saveAndExitButton = page
			.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]')
			.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);
	}

	await saveAndExitButton.click();


	log_info(`Clicking on save and exit button: Complete`);
};

/**
 * This function gets the frame on the second layer  and
 * clicks the reject all button
 *
 * @param {Config} config
 * @param {Page} page
 */
export const clickRejectAllSecondLayer = async (config: Config, page: Page, isAmp: boolean = false) => {
	log_info(`Clicking on reject all button: Start`);
	let rejectAllButton;
	if(isAmp) {
		rejectAllButton = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.frameLocator(ELEMENT_ID.CMP_CONTAINER).last()
			.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL);
	} else {
		rejectAllButton = page.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]').locator(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL);
	}

	await rejectAllButton.click();

	log_info(`Clicking on reject all button: Complete`);
};

/**
 * This function checks for interaction with GAM
 * Using this after advice from Commercial to check that cookies were accepted as we otherwise do not interact with GAM
 * This has to be adjusted if anything in the interaction with GAM changes or we stop using GAM
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkTopAdHasLoaded = async (page: Page) => {
	log_info(`Waiting for interaction with GAM: Start`);

	const gamUrl = /https:\/\/securepubads.g.doubleclick.net\/gampad\/ads/;

	const getEncodedParamsFromRequest = (
		request: Request,
		paramName: string,
	): URLSearchParams | null => {
		const url = new URL(request.url());
		const param = url.searchParams.get(paramName);
		if (!param) {
			return null;
		}
		const paramDecoded = decodeURIComponent(param);
		const searchParams = new URLSearchParams(paramDecoded);
		return searchParams;
	};

	const assertOnSlotFromRequest = (
		request: Request,
		expectedSlot: string,
	) => {
		const isURL = request.url().match(gamUrl);
		if (!isURL) {
			return false;
		}
		const searchParams = getEncodedParamsFromRequest(request, 'prev_scp');
		if (searchParams === null) {
			return false;
		}
		const slot = searchParams.get('slot');
		if (slot !== expectedSlot) {
			return false;
		}
		return true;
	};

	const waitForGAMRequestForSlot = (page: Page, slotExpected: string) => {
		return page.waitForRequest((request) =>
			assertOnSlotFromRequest(request, slotExpected),
		);
	};

	const gamRequestPromise = waitForGAMRequestForSlot(page, 'top-above-nav');
	await gamRequestPromise;

	log_info(`Waiting for interaction with GAM: Complete`);
};

/**
 * Waits for an interaction with Google Ad Manager (GAM) by monitoring the network requests.
 *
 * @param page - The Puppeteer page object.
 * @returns A promise that resolves when the interaction with GAM is complete.
 */
export const checkGoogleAdManagerRequestIsMade = async (
	page: Page,
): Promise<void> => {
	log_info(`Waiting for interaction with GAM: Start`);
	const gamUrl = /https:\/\/securepubads.g.doubleclick.net\/gampad\/ads/;

	await page.waitForRequest(gamUrl);
	log_info(`Waiting for interaction with GAM: Complete`);
};

export const checkAds = async (page: Page, isAmp: boolean = false) : Promise<void> => {
	if (isAmp) {
		await checkGoogleAdManagerRequestIsMade(page);
	} else {
		await checkTopAdHasLoaded(page);
	}
}

/**
 * This function checks the ad is not on the page
 * This checks that the top ad frame does not appear on the page
 * The top ad frame might start to appear if we use ads that do not require consent in which case this function has to be adjusted
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
export const checkCMPIsOnPage = async (
	page: Page,
	isAmp: boolean = false,
): Promise<void> => {
	log_info(`Waiting for CMP: Start`);

	let cmpl;

	if (isAmp) {
		cmpl = page
			.frameLocator(ELEMENT_ID.AMP_CMP_CONTAINER)
			.locator(ELEMENT_ID.CMP_CONTAINER);
	} else {
		cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER);
	}

	await cmpl.waitFor();

	if (!isAmp) {
		await recordVersionOfCMP(page);
	}

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
export const checkCMPIsNotVisible = async (page: Page, isAmp: boolean = false): Promise<void> => {
	log_info(`Checking CMP is Hidden: Start`);

	let cmpl;
	if(isAmp) {
		cmpl = page.locator(ELEMENT_ID.AMP_CMP_CONTAINER).locator(ELEMENT_ID.CMP_CONTAINER);
	}else {
		cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER);
	}


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
 * @param {number} LoadingTime
 * @param {number} cmpVersion
 * @param {Config} config
 */
export const logCMPLoadTimeAndVersion = async (
	loadingTime: number,
	cmpVersion: number,
	config: Config,
) => {
	log_info(`Logging Timestamp: Start`);
	log_info(`CMP Loading Time: ${loadingTime}`);
	log_info(`CMP Version: ${cmpVersion}`);

	await sendMetricData(config, loadingTime, cmpVersion);

	log_info(`Logging Timestamp: Complete`);
};

/**
 *
 *
 * @param {Config} config
 * @param {number} timeToLoadInSeconds
 * @param {number} cmpVersion
 */
export const sendMetricData = async (
	config: Config,
	timeToLoadInSeconds: number,
	cmpVersion: number,
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
			{
				MetricName: 'CmpVersion',
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
				Unit: 'None',
				Value: cmpVersion,
			},
		],
		Namespace: 'Application',
	} satisfies PutMetricDataCommandInput;

	const command = new PutMetricDataCommand(params);

	await client.send(command);
};

/**
 * This function checks the timestamp, loads a page and checks how long it took for the CMP
 * banner to appear.
 *
 * @param {Page} page
 * @param {Config} config
 */
export const checkCMPLoadingTimeAndVersion = async (
	page: Page,
	config: Config,
) => {
	if (!config.isRunningAdhoc) {
		log_info('Checking CMP Loading Time and CMP Version: Start');
		const startTimeStamp = Date.now();
		await loadPage(page, config.frontUrl);
		await checkCMPIsOnPage(page); // Wait for CMP to appear
		const endTimeStamp = Date.now();
		const loadingTime = (endTimeStamp - startTimeStamp) / 1000; //in seconds

		const functionToGetVersion = function () {
			return window._sp_.version;
		};
		const cmpVersionString = await page.evaluate(functionToGetVersion);
		const cmpVersionDouble = parseFloat(
			cmpVersionString.replace(/\./g, ''),
		);
		await logCMPLoadTimeAndVersion(loadingTime, cmpVersionDouble, config);
		log_info('Checking CMP Loading Time and CMP Version: Finished');
	}
};
