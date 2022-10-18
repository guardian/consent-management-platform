import Chromium from 'chrome-aws-lambda';
import type { Browser, CDPSession, Frame, Page } from 'puppeteer-core';
import type { Config, CustomPuppeteerOptions } from '../types';
import { ELEMENT_ID } from '../types';

export const log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};

export const log_error = (message: string): void => {
	console.log(`(cmp monitoring): error: ${message}`);
};

export const clearCookies = async (client: CDPSession): Promise<void> => {
	await client.send('Network.clearBrowserCookies');

	log_info(`Cleared Cookies`);
};

export const clearLocalStorage = async (page: Page): Promise<void> => {
	await page.evaluate(() => localStorage.clear());

	log_info(`Cleared LocalStorage`);
};

const initialiseOptions = async (
	isDebugMode: boolean,
): Promise<CustomPuppeteerOptions> => {
	return {
		headless: !isDebugMode,
		args: isDebugMode ? ['--window-size=1920,1080'] : Chromium.args,
		defaultViewport: Chromium.defaultViewport,
		executablePath: await Chromium.executablePath,
		ignoreHTTPSErrors: true,
		devtools: isDebugMode,
		timeout: 0,
	};
};

const launchBrowser = async (ops: CustomPuppeteerOptions): Promise<Browser> => {
	return await Chromium.puppeteer.launch(ops);
};

export const makeNewBrowser = async (debugMode: boolean): Promise<Browser> => {
	const ops = await initialiseOptions(debugMode);
	const browser = await launchBrowser(ops);
	return browser;
};

export const openPrivacySettingsPanel = async (config: Config, page: Page) => {
	log_info(`Loading privacy settings panel: Start`);
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(3000);

	const frame = getFrame(page, config.iframeDomain);
	await frame.click(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);

	log_info(`Loading privacy settings panel: Complete`);
};

export const checkPrivacySettingsPanelIsOpen = async (
	config: Config,
	page: Page,
): Promise<void> => {
	await page.waitForTimeout(3000);
	log_info(`Waiting for Privacy Settings Panel: Start`);
	const frame = getFrame(page, config.iframeDomainSecondLayer);
	await frame.waitForSelector(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	log_info(`Waiting for Privacy Settings Panel: Complete`);
};

export const clickSaveAndCloseSecondLayer = async (
	config: Config,
	page: Page,
) => {
	log_info(`Clicking on save and close button: Start`);
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(3000);

	const frame = getFrame(page, config.iframeDomainSecondLayer);
	await frame.click(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);

	log_info(`Clicking on save and exit button: Complete`);
};

export const clickRejectAllSecondLayer = async (config: Config, page: Page) => {
	log_info(`Clicking on reject all button: Start`);

	await page.waitForTimeout(3000);

	const frame = getFrame(page, config.iframeDomainSecondLayer);

	await frame.click(ELEMENT_ID.TCFV2_SECOND_LAYER_REJECT_ALL);

	log_info(`Clicking on reject all button: Complete`);
};

export const getFrame = (page: Page, iframeUrl: string): Frame => {
	const frame = page.frames().find((f) => f.url().startsWith(iframeUrl));

	if (frame === undefined) {
		throw new Error(`Could not find frame ${iframeUrl} : Failed`);
	}

	return frame;
};

export const checkTopAdHasLoaded = async (page: Page): Promise<void> => {
	log_info(`Waiting for ads to load: Start`);
	await page.waitForSelector(ELEMENT_ID.TOP_ADVERT, { timeout: 30000 });
	log_info(`Waiting for ads to load: Complete`);
};

export const checkCMPIsOnPage = async (page: Page): Promise<void> => {
	log_info(`Waiting for CMP: Start`);
	await page.waitForSelector(ELEMENT_ID.CMP_CONTAINER);
	log_info(`Waiting for CMP: Complete`);
};

export const checkCMPIsNotVisible = async (page: Page): Promise<void> => {
	log_info(`Checking CMP is Hidden: Start`);

	const getSpMessageDisplayProperty = function (selector: string) {
		const element = document.querySelector(selector);
		if (element) {
			const computedStyle = window.getComputedStyle(element);
			return computedStyle.getPropertyValue('display');
		}
	};
	// When testing AUS locally over a VPN we need to make sure everything has finished
	// loading before testing for existence of CMP otherwise we are prone to false positives.
	// await page.waitForTimeout(3000); // for testing AUS over a VPN
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

export const loadPage = async (page: Page, url: string): Promise<void> => {
	log_info(`Loading page: Start`);

	await page.setCacheEnabled(false);

	const response = await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});

	// For some reason VSCode thinks the conditional is not needed, because `!response` is always falsy 🤔
	// TODO: clarify that...
	//if (!response) {
	//	log_error('Loading URL: Failed');
	//	throw 'Failed to load page!';
	//}

	// If the response status code is not a 2xx success code
	if (response.status() < 200 || response.status() > 299) {
		log_error(`Loading URL: Error: Status ${response.status()}`);
		throw 'Failed to load page!';
	}

	log_info(`Loading page: Complete`);
};

export const reloadPage = async (page: Page) => {
	log_info(`Reloading page: Start`);
	const reloadResponse = await page.reload({
		waitUntil: ['domcontentloaded'],
		timeout: 3000,
	});
	if (!reloadResponse) {
		log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}
	log_info(`Reloading page: Complete`);
};
