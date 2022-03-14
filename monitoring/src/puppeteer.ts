import {Browser, Page, Viewport} from "puppeteer-core";
const fs = require("fs");
const path = require("path");

const chromium = require('chrome-aws-lambda');

type CustomPuppeteerOptions = {
	headless: boolean,
	args: string[],
	defaultViewport: Required<Viewport>,
	executablePath: string,
	ignoreHTTPSErrors: boolean,
	devtools?: boolean,
	timeout?: number,
	waitUntil?: string,
	dumpio?: boolean
}

const checkCMPIsHidden = async (page: Page) => {
	const display = await page.evaluate(
		`window.getComputedStyle(document.querySelector('[id*=\\"sp_message_container\\"]')).getPropertyValue('display')`,
	);

	// Use `!=` rather than `!==` here because display is a DOMString type
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

const checkPage = async function (browser: Browser, URL: string) {
	const page: Page = await browser.newPage();

	//clear cookies
	const client = await page.target().createCDPSession();
	await client.send('Network.clearBrowserCookies');

	const response = await page.goto(URL, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});
	if (!response) {
		throw 'Failed to load page!';
	}

	//If the response status code is not a 2xx success code
	if (response.status() < 200 || response.status() > 299) {
		throw 'Failed to load page!';
	}

	// wait for CMP
	await page.waitForSelector('[id*="sp_message_container"]');

	// Wait for iframe to load into sp_message_container
	await page.waitFor(5000);

	// Click on Yes I'm happy
	const frame = page
		.frames()
		.find((f) => f.url().startsWith('https://sourcepoint.theguardian.com'));

	if (!frame) {
		throw 'CMP not found on page!';
	}

	await frame.click('button[title="Yes, I’m happy"]');

	await page.waitFor(5000);

	await checkCMPIsHidden(page);

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

const initialiseOptions = async (isDebugMode: boolean): Promise<CustomPuppeteerOptions> => {
	return {
		headless: !isDebugMode,
		args: isDebugMode ? ['--window-size=1920,1080'] : chromium.args,
		defaultViewport: isDebugMode ? null : chromium.defaultViewport,
		executablePath: await chromium.executablePath,
		ignoreHTTPSErrors: true,
		devtools: isDebugMode,
		timeout: 0
	}
}

const launchBrowser = async (ops: CustomPuppeteerOptions): Promise<Browser> => {
	return await chromium.puppeteer.launch(ops);
}

const run = async (browser: Browser | null, url: string, isDebugMode: boolean) => {
	const ops = await initialiseOptions(isDebugMode);
	browser = await launchBrowser(ops);

	await checkPage(browser, url)

	return browser;
}

const terminate = async (browser: Browser | null) => {
	if (browser !== null) {
		await browser.close()
	}
}

export {run, terminate}
