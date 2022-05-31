import type { Browser, Page } from 'puppeteer-core';
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

const interactWithCMP = async (page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Do not sell my personal information" on CMP`);
	const frame = page
		.frames()
		.find((f) => f.url().startsWith('https://ccpa-notice.sp-prod.net'));
	if (frame === undefined) {
		return;
	}

	await frame.click('button[title="Do not sell my personal information"]');
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
	// const page = await synthetics.getPage();
	const browser: Browser = await makeNewBrowser();
	const page: Page = await browser.newPage();

	log_info(`Start checking subsequent Page URL: ${url}`);

	await loadPage(page, url);

	await checkCMPIsNotVisible(page);

	await checkTopAdHasLoaded(page);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (url: string, nextUrl: string) => {
	// const page = await synthetics.getPage();
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

export const mainCheck = async function (): Promise<void> {
	log_info('checkPage, new version (ccpa)');
	await checkPages(
		'https://www.theguardian.com/us?adtest=fixed-puppies',
		'https://www.theguardian.com/us-news/2021/jul/05/gray-wolves-wisconsin-hunting-population?adtest=fixed-puppies',
	);
	await checkPages(
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake?adtest=fixed-puppies',
		'',
	);
};
