import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import chromium from '@sparticuz/chromium';
import { launch } from 'puppeteer-core';
import type { Browser, CDPSession, Frame, Metrics, Page } from 'puppeteer-core';
import type { Config, CustomPuppeteerOptions } from '../types';
import { ELEMENT_ID } from '../types';

const waitAfterCMPTimeout = 2000; //wait in the hope that sourcepoint has persisted the choice
const elementTimeout = 20000; //timeout for all loads etc. Default is 30000

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
	const client: CDPSession = await page.target().createCDPSession();
	await client.send('Network.clearBrowserCookies');
	await client.detach();
	log_info(`Cleared Cookies`);
};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const clearLocalStorage = async (page: Page): Promise<void> => {
	await page.evaluate(() => localStorage.clear());

	log_info(`Cleared LocalStorage`);
};

/**
 * This function creates an object for the chromium browser options
 *
 * @param {boolean} isDebugMode
 * @return {*}  {Promise<CustomPuppeteerOptions>}
 */
const initialiseOptions = async (
	isDebugMode: boolean, slowMo: number
): Promise<CustomPuppeteerOptions> => {
	return {
		headless: !isDebugMode,
		args: isDebugMode ? ['--window-size=1920,1080'] : chromium.args.concat( '--disable-dev-shm-usage'),
		defaultViewport: chromium.defaultViewport,
		executablePath:
			process.env.IS_LOCAL == 'true'
				? '/opt/homebrew/bin/chromium'
				: await chromium.executablePath(`/var/task/bin`),
		ignoreHTTPSErrors: true,
		devtools: isDebugMode,
		timeout: 0,
		slowMo: slowMo,
	};
};

/**
 * This function launches the chromium browser.
 *
 * @param {CustomPuppeteerOptions} ops
 * @return {*}  {Promise<Browser>}
 */
const launchBrowser = async (ops: CustomPuppeteerOptions): Promise<Browser> => {
	return await launch(ops);
};

/**
 * This function creates a new chromium browser
 * with defined options
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
export const makeNewBrowser = async (debugMode: boolean, slowMo: number = 0): Promise<Browser> => {
	chromium.setGraphicsMode = false; //required for browser.close() not to hang
	const ops = await initialiseOptions(debugMode, slowMo);
	const browser = await launchBrowser(ops);
	return browser;
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
export const openPrivacySettingsPanel = async (config: Config, page: Page) => {
	log_info(`Loading privacy settings panel: Start`);

	const frame = await getFrame(page, config.iframeDomain);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES, {visible: true});
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);

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

	const frame = await getFrame(page, config.iframeDomainSecondLayer);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);

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

	const frame = await getFrame(page, config.iframeDomainSecondLayer);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT, {visible: true});
	await frame.click(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);

	await new Promise(r => setTimeout(r, waitAfterCMPTimeout)); //wait in the hope that sourcepoint has persisted the choice

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

	const frame = await getFrame(page,config.iframeDomainSecondLayer);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL, {visible: true});
	await frame.click(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL);

	await new Promise(r => setTimeout(r, waitAfterCMPTimeout)); //wait for 2 seconds to hope that sourcepoint has persisted the choice

	log_info(`Clicking on reject all button: Complete`);
};

/**
 * This function find an iframe on a provided page
 * using the iframeUrl
 *
 * @param {Page} page
 * @param {string} iframeUrl
 * @return {*}  {Frame}
 */
export const getFrame = async (page: Page, iframeUrl: string, timeout: number = elementTimeout): Promise<Frame> => {
 try {
	const frame = await page.waitForFrame( f => f.url().startsWith(iframeUrl), {timeout: timeout});
	return frame;
 } catch (error) {
	console.error(error);
	throw new Error(`Could not find frame "${iframeUrl}" : Failed`);
 }
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

	await page.waitForSelector(ELEMENT_ID.TOP_ADVERT, { timeout: elementTimeout });

	log_info(`Waiting for ads to load: Complete`);
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

	await page.waitForSelector(ELEMENT_ID.CMP_CONTAINER)
	await recordVersionOfCMP(page); // needs to be called here otherwise not yet loaded.

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

	const getSpMessageDisplayProperty = function (selector: string) {
		const element = document.querySelector(selector);
		if (element) {
			const computedStyle = window.getComputedStyle(element);
			return computedStyle.getPropertyValue('display');
		}
	};

	const display = await page.evaluate(
		getSpMessageDisplayProperty,
		ELEMENT_ID.CMP_CONTAINER,
	);

	// Use `!=` rather than `!==` here because display is a DOMString type
	if (display && display != 'none') {
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
	log_info(`Loading page: Start - ${url}`);
	await page.setCacheEnabled(false);

	const response = await page.goto(url, {
		waitUntil: 'networkidle2',
		timeout: elementTimeout,
	});

	// If the response status code is not a 2xx success code
	if (response != null) {
		if (response.status() < 200 || response.status() > 299) {
			log_error(`Loading URL: Error: Status ${response.status()}`);
			throw 'Failed to load page!';
		}
	}

	//log_info(`Bringing page to front`);
	//await page.bringToFront();

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
		waitUntil: ['networkidle2'],
		timeout: elementTimeout,
	});
	if (!reloadResponse) {
		log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}

	log_info(`Reloading page: Complete`);
};

/**
 * This function returns the Metrics object
 *
 * @param {Page} page
 * @return {*}  {Promise<Metrics>}
 */
export const getPageMetrics = async (page: Page): Promise<Metrics> => {
	log_info(`Getting Page Metrics: Complete`);

	return await page.metrics();
};

/**
 * This function compares the current timestamp to a previous start time and logs
 *
 * @param {Page} page
 * @param {Metrics} startMetrics
 */
export const logCMPLoadTime = async (
	page: Page,
	config: Config,
	startMetrics: Metrics,
) => {
	log_info(`Logging Timestamp: Start`);

	const metrics = await page.metrics();
	if (metrics.Timestamp && startMetrics.Timestamp) {
		const timeDiff = metrics.Timestamp - startMetrics.Timestamp;
		await sendMetricData(config, timeDiff);
	}

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
						Value: config.stage.toUpperCase(),
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
		await Promise.all([
			clearCookies(page),
			clearLocalStorage(page)
		]);

		const metrics = await getPageMetrics(page); // Get page metrics before loading page (Timestamp is used)

		await loadPage(page, config.frontUrl);
		await checkCMPIsOnPage(page); // Wait for CMP to appear
		await logCMPLoadTime(page, config, metrics); // Calculate and log time to load CMP
	}
};


/**
 * This function clicks the accept button and waits a fixed time to give sourcepoint time to persist the choise
 *
 * @param {Page} page
 * @return {*}  {Promise<CDPSession>}
 */
export const clickAcceptAllCookies = async (config: Config, page: Page, buttonText: string) => {

	log_info(`Clicking on "${buttonText}" on CMP`);

	const frame = await getFrame(page, config.iframeDomain);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL, {visible: true});
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);

	await new Promise(r => setTimeout(r, waitAfterCMPTimeout)); //wait in the hope that sourcepoint has persisted the choice

	log_info(`Clicked on "${buttonText}" on CMP`);
};
