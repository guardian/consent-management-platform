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

const checkTopAdDidNotLoad = async (page: Page): Promise<void> => {
	log_info(`Checking ads do not load: Start`);

	const frame = await page.$(
		'.ad-slot--top-above-nav .ad-slot__content iframe',
	);

	if (frame !== null) {
		log_error(`Checking ads do not load: Failed`);
		throw Error('Top above nav frame present on page');
	}

	log_info(`Checking ads do not load: Complete`);
};

const interactWithCMP = async (config: Config, page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Yes I'm Happy" on CMP`);
	const frame = page
		.frames()
		.find((f) => f.url().startsWith(config.iframeDomain));
	if (frame === undefined) {
		return;
	}

	await frame.click('button[title="Yes, I’m happy"]');
};

const checkCMPDidNotLoad = async (page: Page) => {
	log_info(`Checking CMP does not load: Start`);

	const spMessageContainer = await page.$('[id*="sp_message_container"]');

	if (spMessageContainer !== null) {
		log_error(`Checking CMP does not load: Failed`);
		throw Error('CMP present on page');
	}

	log_info(`Checking CMP does not load: Complete`);
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

const checkSubsequentPage = async (
	browser: Browser,
	config: Config,
	url: string,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkTopAdHasLoaded(page);
	const client = await page.target().createCDPSession();
	await clearCookies(client);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await interactWithCMP(config, page);
	await checkCMPIsNotVisible(page);
	await checkTopAdHasLoaded(page);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (config: Config, url: string, nextUrl: string) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser();
	const page: Page = await browser.newPage();

	// Clear cookies before starting testing, to ensure the CMP is displayed.
	const client = await page.target().createCDPSession();
	await clearCookies(client);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await checkTopAdDidNotLoad(page);

	await interactWithCMP(config, page);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	await checkCMPDidNotLoad(page);

	if (nextUrl) {
		await checkSubsequentPage(browser, config, nextUrl);
	}
};

export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (tcfv2)');
	await checkPages(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
	);
	await checkPages(config, `${config.articleUrl}?adtest=fixed-puppies`, '');
};