import type {
	PutMetricDataCommandInput
} from '@aws-sdk/client-cloudwatch';
import {
	CloudWatchClient,
	PutMetricDataCommand
} from '@aws-sdk/client-cloudwatch';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import {
	selfCheckCMPIsNotVisible,
	selfCheckCMPIsOnPage,
	selfCheckPrivacySettingsPanelIsOpen,
	selfCheckTopAdDidNotLoad,
	selfCheckTopAdHasLoaded,
	selfClearCookies,
	selfClearLocalStorage,
	selfClickAcceptAllCookies,
	selfClickRejectAllSecondLayer,
	selfClickSaveAndCloseSecondLayer,
	selfLoadPage,
	selfMakeNewBrowser,
	selfMakeNewPage,
	selfOpenPrivacySettingsPanel,
	selfReloadPage
} from '../../../src/consumer-self-test/consumer-self-test';
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
	console.error(`(cmp monitoring): error: ${message}`);
};

/**
 * This function will clear the cookies for a chromium client
 *
 * @param {CDPSession} client
 * @return {*}  {Promise<void>}
 */
export const clearCookies = async (page: Page): Promise<void> => {
	await selfClearCookies(page);

};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const clearLocalStorage = async (page: Page): Promise<void> => {
	await selfClearLocalStorage(page);
	//log_info(`Cleared LocalStorage`);
};

/**
 * This function creates a new chromium browser
 *
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
export const makeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await selfMakeNewBrowser(debugMode);
	return browser;
};

/**
 * This function creates a new page
 *
 * @param {BrowserContext} context
 * @return {*}  {Promise<Page>}
 */
export const makeNewPage = async (context: BrowserContext): Promise<Page> => {
	const page = await selfMakeNewPage(context);
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

  	await selfClickAcceptAllCookies(page, ELEMENT_ID.CMP_CONTAINER, ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);

	log_info(`Clicked on "${textToPrintToConsole}"`);
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
export const openPrivacySettingsPanel = async (config: Config, page: Page) => {

	await selfOpenPrivacySettingsPanel(config.iframeDomainSecondLayer, page, ELEMENT_ID.CMP_CONTAINER, ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL, ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE)

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

	await selfCheckPrivacySettingsPanelIsOpen(config.iframeDomainSecondLayer, page, ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);

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
	//log_info(`Clicking on save and close button: Start`);

	await selfClickSaveAndCloseSecondLayer(config.iframeDomainSecondLayer, page, ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);

	//log_info(`Clicking on save and exit button: Complete`);
};

/**
 * This function gets the frame on the second layer  and
 * clicks the reject all button
 *
 * @param {Config} config
 * @param {Page} page
 */
export const clickRejectAllSecondLayer = async (config: Config, page: Page) => {
	//log_info(`Clicking on reject all button: Start`);

	await selfClickRejectAllSecondLayer(config.iframeDomainSecondLayer, page, ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL)

	//log_info(`Clicking on reject all button: Complete`);
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
	//log_info(`Waiting for interaction with GAM: Start`);

	await selfCheckTopAdHasLoaded(page);

	//log_info(`Waiting for interaction with GAM: Complete`);
};

/**
 * This function checks the ad is not on the page
 * This checks that the top ad frame does not appear on the page
 * The top ad frame might start to appear if we use ads that do not require consent in which case this function has to be adjusted
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkTopAdDidNotLoad = async (page: Page) => {
	//log_info(`Checking ads do not load: Start`);

	await selfCheckTopAdDidNotLoad(page, ELEMENT_ID.TOP_ADVERT);

	//log_info(`Checking ads do not load: Complete`);
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
	//log_info(`Waiting for CMP: Start`);

	await selfCheckCMPIsOnPage(page, ELEMENT_ID.CMP_CONTAINER);

	//log_info(`Waiting for CMP: Complete`);
};

/**
 * This function checks whether the CMP banner display is none
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkCMPIsNotVisible = async (page: Page): Promise<void> => {
	//log_info(`Checking CMP is Hidden: Start`);

	await selfCheckCMPIsNotVisible(page, ELEMENT_ID.CMP_CONTAINER);

	//log_info('CMP hidden or removed from page');
};


/**
 * This function loads a url onto a chromium page
 *
 * @param {Page} page
 * @param {string} url
 * @return {*}  {Promise<void>}
 */
export const loadPage = async (page: Page, url: string): Promise<void> => {
	//log_info(`Loading page: Start`);
	//log_info(`Loading page ${url}`);

	await selfLoadPage(page, url);

	//log_info(`Loading page: Complete`);
};

/**
 * This function reloads the chromium page
 *
 * @param {Page} page
 */
export const reloadPage = async (page: Page) => {
	//log_info(`Reloading page: Start`);

	await selfReloadPage(page);

	//log_info(`Reloading page: Complete`);
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
	config: Config
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
	cmpVersion:number
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
export const checkCMPLoadingTimeAndVersion = async (page: Page, config: Config) => {
	if (!config.isRunningAdhoc){
		log_info('Checking CMP Loading Time and CMP Version: Start')
		const startTimeStamp = Date.now();
		await loadPage(page, config.frontUrl);
		await checkCMPIsOnPage(page); // Wait for CMP to appear
		const endTimeStamp = Date.now();
		const loadingTime = (endTimeStamp - startTimeStamp)/1000; //in seconds

		const functionToGetVersion = function () {
			return window._sp_.version;
		};
		const cmpVersionString = await page.evaluate(functionToGetVersion);
		const cmpVersionDouble = parseFloat(cmpVersionString.replace(/\./g, ''));
		await logCMPLoadTimeAndVersion(loadingTime, cmpVersionDouble, config);
		log_info('Checking CMP Loading Time and CMP Version: Finished');
	}
};

