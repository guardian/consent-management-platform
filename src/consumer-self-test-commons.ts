import type { Browser, BrowserContext, Page } from 'playwright-core';
import { launchChromium } from 'playwright-aws-lambda';
import type { ClickAcceptAllCookies, GetCMPVersionRunning, Log_error, Log_info } from './types/consumer-self-test';

const ELEMENT_ID = {
	TCFV2_FIRST_LAYER_ACCEPT_ALL:
		'div.message-component.message-row > button.sp_choice_type_11',
	CMP_CONTAINER: '[id*="sp_message_iframe"]',
};

/**
 * This function console logs an info message.
 *
 * @param {string} message
 */
export const log_info: Log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};

/**
 * This function console logs an error message.
 *
 * @param {string} message
 */
export const log_error: Log_error = (message: string): void => {
	console.error(`(cmp monitoring): error: ${message}`);
};

/**
 * This function waits for the page to load
 * clicks the accept all button
 *
 * @param {Config} config
 * @param {Page} page
 * @param {string} textToPrintToConsole
 */
export const clickAcceptAllCookies: ClickAcceptAllCookies = async (page: Page, textToPrintToConsole: string) => {

	log_info(`Clicking on "${textToPrintToConsole}" on CMP`);

	const acceptAllButton = page.frameLocator(ELEMENT_ID.CMP_CONTAINER).locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
  	await acceptAllButton.click();

	log_info(`Clicked on "${textToPrintToConsole}"`);
};

export const getCMPVersionRunning: GetCMPVersionRunning = async (page: Page) => {
	log_info(`Sourcepoint version: ${await page.evaluate('window._sp_.version')}`);
	log_info(`CMP version: ${await page.evaluate('window.guCmpHotFix.cmp.version')}`);
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
	await getCMPVersionRunning(page);
	if (!(await cmpl.isVisible())) {
		throw Error('CMP is not present on page');
	}

	log_info(`Waiting for CMP: Complete`);
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
 * This function creates a new chromium browser
 *
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
export const makeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await launchChromium({headless:!debugMode});
	return browser;
};

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
