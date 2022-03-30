import Chromium from 'chrome-aws-lambda';
import type { Browser, Page } from 'puppeteer-core';
import type { Config, CustomPuppeteerOptions } from './types';

const checkCmpIsHidden = async (page: Page) => {
	const getSpMessageDisplayProperty = function () {
		const querySelector = document.querySelector(
			'[id*="sp_message_container"]',
		);
		if (querySelector) {
			const computedStyle = window.getComputedStyle(querySelector);
			return computedStyle.getPropertyValue('display');
		}
	};

	const display = await page.evaluate<() => string | undefined>(
		getSpMessageDisplayProperty,
	);

	if (display != 'none') {
		throw Error('CMP still present on page');
	}
};

const checkCMPDidNotLoad = async (page: Page) => {
	const spMessageContainer = await page.$('[id*="sp_message_container"]');

	if (spMessageContainer !== null) {
		throw Error('CMP present on page');
	}
};

const checkPage = async function (config: Config, browser: Browser) {
	const page: Page = await browser.newPage();

	//clear cookies
	const client = await page.target().createCDPSession();
	await client.send('Network.clearBrowserCookies');

	const response = await page.goto(config.baseDomain, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});

	//If the response status code is not a 2xx success code
	if (response.status() < 200 || response.status() > 299) {
		throw 'Failed to load page!';
	}

	// wait for CMP
	await page.waitForSelector('[id*="sp_message_container"]');

	// Wait for iframe to load into sp_message_container
	await page.waitForTimeout(5000);

	// Click on Yes I'm happy
	const frame = page
		.frames()
		.find((f) => f.url().startsWith(config.iframeDomain));

	if (!frame) {
		throw 'CMP not found on page!';
	}

	await frame.click('button[title="Yes, I’m happy"]');

	await page.waitForTimeout(5000);

	await checkCmpIsHidden(page);

	//ads are loaded
	await page.waitForSelector(
		'.ad-slot--top-above-nav .ad-slot__content iframe',
	);

	// Reload page
	const reloadResponse = await page.reload({
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});
	if (!reloadResponse) {
		throw 'Failed to refresh page!';
	}

	// Check top-above-nav on page after clicking opting in and reloading
	await page.waitForSelector(
		'.ad-slot--top-above-nav .ad-slot__content iframe',
	);

	// Check CMP is not present on page after reload
	await checkCMPDidNotLoad(page);
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

const run = async (config: Config, isDebugMode: boolean): Promise<Browser> => {
	const ops = await initialiseOptions(isDebugMode);
	const browser = await launchBrowser(ops);

	await checkPage(config, browser);

	return browser;
};

export { run };
