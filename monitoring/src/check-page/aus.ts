import type { Browser, Page } from 'puppeteer-core';
import type { Config } from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdHasLoaded,
	clearCookies,
	loadPage,
	log_error,
	log_info,
	makeNewBrowser,
} from './common-functions';

// -- Original code from Robert ------------------------------------------------

/*

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

	if (display && display != 'none') {
		throw Error('CMP still present on page');
	}
};

const checkCMPDidNotLoad = async (page: Page) => {
	const spMessageContainer = await page.$('[id*="sp_message_container"]');

	if (spMessageContainer !== null) {
		throw Error('CMP present on page');
	}
};

export const checkPage_old = async function (
	config: Config,
	browser: Browser,
): Promise<void> {
	const page: Page = await browser.newPage();

	//clear cookies
	const client = await page.target().createCDPSession();
	await client.send('Network.clearBrowserCookies');

	const response = await page.goto(config.frontUrl, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	});

	//If the response status code is not a 2xx success code
	if (response.status() < 200 || response.status() > 299) {
		throw 'Failed to load page!';
	}

	// wait for CMP
	await page.waitForSelector('[id*="sp_message_container"]');

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

*/

// -- Code adapted from the aus canary ------------------------------------------------

const interactWithCMP = async (page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	// When AWS Synthetics use a more up-to-date version of Puppeteer,
	// we can make use of waitForFrame(), and remove the timeout above.
	log_info(`Clicking on "Continue" on CMP`);
	const frame = page
		.frames()
		.find((f) => f.url().startsWith('https://ccpa-notice.sp-prod.net'));
	if (frame === undefined) {
		return;
	}

	await frame.click('button[title="Continue"]');
};

const reloadPage = async (page: Page) => {
	log_info(`Reloading page: Start`);
	const reloadResponse = await page.reload({
		waitUntil: ['networkidle0', 'domcontentloaded'],
		timeout: 30000,
	});
	if (!reloadResponse) {
		log_error(`Reloading page: Failed`);
		throw 'Failed to refresh page!';
	}
	log_info(`Reloading page: Complete`);
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 */

const checkSubsequentPage = async (url: string) => {
	//const page = await synthetics.getPage();
	log_info(`Start checking subsequent Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser();
	const page: Page = await browser.newPage();

	await loadPage(page, url);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (url: string, nextUrl: string) => {
	//const page = await synthetics.getPage();
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser();
	const page: Page = await browser.newPage();

	// Clear cookies before starting testing, to ensure the CMP is displayed.
	const client = await page.target().createCDPSession();
	await clearCookies(client);

	await loadPage(page, url);

	await checkTopAdHasLoaded(page);

	await checkCMPIsOnPage(page);

	await interactWithCMP(page);

	await checkCMPIsNotVisible(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	if (nextUrl) {
		await checkSubsequentPage(nextUrl);
	}
};

export const mainCheck = async function (
	config: Config,
	browser: Browser,
): Promise<void> {
	log_info('checkPage, new version (aus)');
	await checkPages(
		'https://www.theguardian.com/au?adtest=fixed-puppies',
		'https://www.theguardian.com/us-news/2021/jul/05/gray-wolves-wisconsin-hunting-population?adtest=fixed-puppies',
	);
	await checkPages(
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake?adtest=fixed-puppies',
		'',
	);
	const page: Page = await browser.newPage();
	page;
};
