import Chromium from 'chrome-aws-lambda';
import type { Browser, CDPSession, Page } from 'puppeteer-core';
import type { Config, CustomPuppeteerOptions } from '../types';

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

export const openPrivacySettingsPage = async (config: Config, page: Page) => {
	const frame = page
		.frames()
		.find((f) => f.url().startsWith(config.iframeDomain));
	if (frame === undefined) {
		return;
	}

	await frame.click('button[class=""]');
};

export const checkTopAdHasLoaded = async (page: Page): Promise<void> => {
	log_info(`Waiting for ads to load: Start`);
	await page.waitForSelector(
		'.ad-slot--top-above-nav .ad-slot__content iframe',
		{ timeout: 30000 },
	);
	log_info(`Waiting for ads to load: Complete`);
};

export const checkCMPIsOnPage = async (page: Page): Promise<void> => {
	log_info(`Waiting for CMP: Start`);
	await page.waitForSelector('[id*="sp_message_container"]');
	log_info(`Waiting for CMP: Finish`);
};

export const checkCMPIsNotVisible = async (page: Page): Promise<void> => {
	log_info(`Checking CMP is Hidden: Start`);

	const getSpMessageDisplayProperty = function () {
		const element = document.querySelector('[id*="sp_message_container"]');
		if (element) {
			const computedStyle = window.getComputedStyle(element);
			return computedStyle.getPropertyValue('display');
		}
	};

	const display = await page.evaluate(getSpMessageDisplayProperty);

	// Use `!=` rather than `!==` here because display is a DOMString type
	if (display && display != 'none') {
		throw Error('CMP still present on page');
	}

	log_info('CMP hidden or removed from page');
};

export const loadPage = async (page: Page, url: string): Promise<void> => {
	log_info(`Loading page: Start`);

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
