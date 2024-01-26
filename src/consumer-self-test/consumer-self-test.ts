
import { launchChromium } from 'playwright-aws-lambda';
import type { Browser, BrowserContext, Page, Request } from 'playwright-core';

export class ConsumerSelfTest {

/**
 * This function console logs an info message.
 *
 * @param {string} message
 */
log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};

/**
 * This function console logs an error message.
 *
 * @param {string} message
 */
log_error = (message: string): void => {
	console.error(`(cmp monitoring): error: ${message}`);
};

/**
 * This function will clear the cookies for a chromium client
 *
 * @param {CDPSession} client
 * @return {*}  {Promise<void>}
 */
elfClearCookies = async (page: Page): Promise<void> => {
	await page.context().clearCookies();
	this.log_info(`Cleared Cookies`);
};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfClearLocalStorage = async (page: Page): Promise<void> => {
	await page.evaluate(() => window.localStorage.clear());
	await page.evaluate(() => window.sessionStorage.clear());
	this.log_info(`Cleared LocalStorage`);

};

/**
 * This function creates a new chromium browser
 *
 * @param {boolean} debugMode
 * @return {*}  {Promise<Browser>}
 */
selfMakeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const browser = await launchChromium({headless:!debugMode});
	return browser;
};

/**
 * This function creates a new page
 *
 * @param {BrowserContext} context
 * @return {*}  {Promise<Page>}
 */
selfMakeNewPage = async (context: BrowserContext): Promise<Page> => {
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
selfClickAcceptAllCookies = async (page: Page, cmpContainer: string, firstLayerAcceptAll: string) => {

	const acceptAllButton = page.frameLocator(cmpContainer).locator(firstLayerAcceptAll);
  	await acceptAllButton.click();
};

/**
 * This function waits for the page to load
 * clicks the manage cookies button to open the privacy settings panel
 * @param {Config} config
 * @param {Page} page
 */
selfOpenPrivacySettingsPanel = async (iframeDomainSecondLayer: string, page: Page, cmpContainer: string, firstLayerManageCookies: string, secondLayerHeadLine: string) => {
	this.log_info(`Loading privacy settings panel: Start`);

	const manageButton = page.frameLocator(cmpContainer).locator(firstLayerManageCookies);
	await manageButton.click();
	await this.selfCheckPrivacySettingsPanelIsOpen(iframeDomainSecondLayer, page, secondLayerHeadLine);

	this.log_info(`Loading privacy settings panel: Complete`);
};

/**
 * This function waits for the page to load
 * Then finds the headline on the second layer
 *
 * @param {Config} config
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfCheckPrivacySettingsPanelIsOpen = async (
	iframeDomainSecondLayer: String,
	page: Page,
	secondLayerHeadline: string
): Promise<void> => {

	this.log_info(`Waiting for Privacy Settings Panel: Start`);

	const secondLayer =  page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerHeadline);
	await secondLayer.waitFor();

	if (!(await secondLayer.isVisible())) {
		throw Error('Second Layer is not present on page');
	}

	this.log_info(`Waiting for Privacy Settings Panel: Complete`);
};

/**
 * This function gets the frame and
 * clicks the save and exit button
 *
 * @param {Config} config
 * @param {Page} page
 */
selfClickSaveAndCloseSecondLayer = async (
	iframeDomainSecondLayer: string,
	page: Page,
	secondLayerSaveAndExit: string
) => {
	this.log_info(`Clicking on save and close button: Start`);

	await page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerSaveAndExit).click();

	this.log_info(`Clicking on save and exit button: Complete`);
};

/**
 * This function gets the frame on the second layer  and
 * clicks the reject all button
 *
 * @param {Config} config
 * @param {Page} page
 */
selfClickRejectAllSecondLayer = async (iframeDomainSecondLayer: string, page: Page, secondLayerRejectAll: string) => {
	this.log_info(`Clicking on reject all button: Start`);

	await page.frameLocator('[src*="' + iframeDomainSecondLayer + '"]').locator(secondLayerRejectAll).click();

	this.log_info(`Clicking on reject all button: Complete`);
};

/**
 * This function checks for interaction with GAM
 * Using this after advice from Commercial to check that cookies were accepted as we otherwise do not interact with GAM
 * This has to be adjusted if anything in the interaction with GAM changes or we stop using GAM
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfCheckTopAdHasLoaded = async (page: Page) => {

	this.log_info(`Waiting for interaction with GAM: Start`);

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

	this.log_info(`Waiting for interaction with GAM: Complete`);
};

/**
 * This function checks the ad is not on the page
 * This checks that the top ad frame does not appear on the page
 * The top ad frame might start to appear if we use ads that do not require consent in which case this function has to be adjusted
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfCheckTopAdDidNotLoad = async (page: Page, topAdvert: string) => {

	this.log_info(`Checking ads do not load: Start`);

	const topAds = page.locator(topAdvert);
	const topAdsCount = await topAds.count();

	if (topAdsCount != 0) {
		this.log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	this.log_info(`Checking ads do not load: Complete`);
};

// TODO: check version of cmp loaded in the page.
recordVersionOfCMP = async (page: Page) => {

	this.log_info('* Getting the version of Sourcepoint CMP');

	this.log_info(await page.evaluate('window.guCmpHotFix.cmp.version'));

};

/**
 * This function checks for the CMP banner on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfCheckCMPIsOnPage = async (page: Page, cmpContainer: string): Promise<void> => {

	this.log_info(`Waiting for CMP: Start`);

	const cmpl =  page.locator(cmpContainer);
	await cmpl.waitFor();
	if (!(await cmpl.isVisible())) {
		throw Error('CMP is not present on page');
	}

	this.log_info(`Waiting for CMP: Complete`);
};

/**
 * This function checks whether the CMP banner display is none
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
selfCheckCMPIsNotVisible = async (page: Page, cmpContainer: string): Promise<void> => {

	this.log_info(`Checking CMP is Hidden: Start`);

	const cmpl = page.locator(cmpContainer);

	if (await cmpl.isVisible()) {
		throw Error('CMP still present on page');
	}

	this.log_info('CMP hidden or removed from page');
};

/**
 * This function loads a url onto a chromium page
 *
 * @param {Page} page
 * @param {string} url
 * @return {*}  {Promise<void>}
 */
selfLoadPage = async (page: Page, url: string): Promise<void> => {

	this.log_info(`Loading page: Start`);
	this.log_info(`Loading page ${url}`);

	const response = await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});

	// If the response status code is not a 2xx success code
	if (response != null) {
		if (response.status() < 200 || response.status() > 299) {
			this.log_error(`Loading URL: Error: Status ${response.status()}`);
			throw 'Failed to load page!';
		}
	}

	this.log_info(`Loading page: Complete`);
};

/**
 * This function reloads the chromium page
 *
 * @param {Page} page
 */
selfReloadPage = async (page: Page) => {

	this.log_info(`Reloading page: Start`);

	const reloadResponse = await page.reload({
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});
	if (!reloadResponse) {
		this.log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}

	this.log_info(`Reloading page: Complete`);
};
}
