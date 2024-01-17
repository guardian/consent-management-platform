
import { launchChromium } from 'playwright-aws-lambda';
import type { Browser, BrowserContext, Page, Request } from 'playwright-core';

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
export const selfClearCookies = async (page: Page): Promise<void> => {
	await page.context().clearCookies();
	log_info(`Cleared Cookies`);
};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const selfClearLocalStorage = async (page: Page): Promise<void> => {
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
export const selfMakeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await launchChromium({headless:!debugMode});
	return browser;
};

/**
 * This function creates a new page
 *
 * @param {BrowserContext} context
 * @return {*}  {Promise<Page>}
 */
export const selfMakeNewPage = async (context: BrowserContext): Promise<Page> => {
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
export const selfClickAcceptAllCookies = async (page: Page, cmpContainer: string, firstLayerAcceptAll: string) => {

	const acceptAllButton = page.frameLocator(cmpContainer).locator(firstLayerAcceptAll);
  	await acceptAllButton.click();
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
export const selfOpenPrivacySettingsPanel = async (iframeDomainSecondLayer: string, page: Page, cmpContainer: string, firstLayerManageCookies: string, secondLayerHeadLine: string) => {
	log_info(`Loading privacy settings panel: Start`);

	const manageButton = page.frameLocator(cmpContainer).locator(firstLayerManageCookies);
	await manageButton.click();
	await selfCheckPrivacySettingsPanelIsOpen(iframeDomainSecondLayer, page, secondLayerHeadLine);

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
export const selfCheckPrivacySettingsPanelIsOpen = async (
	iframeDomainSecondLayer: String,
	page: Page,
	secondLayerHeadline: string
): Promise<void> => {

	log_info(`Waiting for Privacy Settings Panel: Start`);

	const secondLayer =  page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerHeadline);
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
export const selfClickSaveAndCloseSecondLayer = async (
	iframeDomainSecondLayer: string,
	page: Page,
	secondLayerSaveAndExit: string
) => {
	log_info(`Clicking on save and close button: Start`);

	await page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerSaveAndExit).click();

	log_info(`Clicking on save and exit button: Complete`);
};

/**
 * This function gets the frame on the second layer  and
 * clicks the reject all button
 *
 * @param {Config} config
 * @param {Page} page
 */
export const selfClickRejectAllSecondLayer = async (iframeDomainSecondLayer: string, page: Page, secondLayerRejectAll: string) => {
	log_info(`Clicking on reject all button: Start`);

	await page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerRejectAll).click();

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
export const selfCheckTopAdHasLoaded = async (page: Page) => {

	log_info(`Waiting for interaction with GAM: Start`);

	const gamUrl = /https:\/\/securepubads.g.doubleclick.net\/gampad\/ads/;

	const getEncodedParamsFromRequest = (
		request: Request,
		paramName: string,
	): URLSearchParams | null => {
		const url = new URL(request.url());
		const param = url.searchParams.get(paramName);
		if (!param) return null;
		const paramDecoded = decodeURIComponent(param);
		const searchParams = new URLSearchParams(paramDecoded);
		return searchParams;
	};

	const assertOnSlotFromRequest = (request: Request, expectedSlot: string) => {
		const isURL = request.url().match(gamUrl);
		if (!isURL) return false;
		const searchParams = getEncodedParamsFromRequest(request, 'prev_scp');
		if (searchParams === null) return false;
		const slot = searchParams.get('slot');
		if (slot !== expectedSlot) return false;
		return true;
	};

	const waitForGAMRequestForSlot = (page: Page, slotExpected: string) => {
		return page.waitForRequest((request) =>
			assertOnSlotFromRequest(request, slotExpected),
		);
	};

	const gamRequestPromise = waitForGAMRequestForSlot(
		page,
		'top-above-nav',
	);
	await gamRequestPromise;

	log_info(`Waiting for interaction with GAM: Complete`);
};

/**
 * This function checks the ad is not on the page
 * This checks that the top ad frame does not appear on the page
 * The top ad frame might start to appear if we use ads that do not require consent in which case this function has to be adjusted
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const selfCheckTopAdDidNotLoad = async (page: Page, topAdvert: string) => {

	log_info(`Checking ads do not load: Start`);

	const topAds = page.locator(topAdvert);
	const topAdsCount = await topAds.count();

	if (topAdsCount != 0) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

// TODO: check version of cmp loaded in the page.
export const recordVersionOfCMP = async (page: Page) => {

	log_info('* Getting the version of Sourcepoint CMP');

	log_info(await page.evaluate('window.guCmpHotFix.cmp.version'));

};

/**
 * This function checks for the CMP banner on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const selfCheckCMPIsOnPage = async (page: Page, cmpContainer: string): Promise<void> => {

	log_info(`Waiting for CMP: Start`);

	const cmpl =  page.locator(cmpContainer);
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
export const selfCheckCMPIsNotVisible = async (page: Page, cmpContainer: string): Promise<void> => {

	log_info(`Checking CMP is Hidden: Start`);

	const cmpl = page.locator(cmpContainer);

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
export const selfLoadPage = async (page: Page, url: string): Promise<void> => {

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
export const selfReloadPage = async (page: Page) => {

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

