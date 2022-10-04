import type { Browser, Page } from 'puppeteer-core';
import type { Config, UspData } from '../types';
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

const clickDoNotSellMyInfo = async (config: Config, page: Page) => {
	// Ensure that Sourcepoint has enough time to load the CMP
	await page.waitForTimeout(5000);

	log_info(`Clicking on "Do not sell my personal information" on CMP`);
	const frame = page
		.frames()
		.find((f) => f.url().startsWith(config.iframeDomain));
	if (frame === undefined) {
		return;
	}

	await frame.click('div.message-component > button.sp_choice_type_13');
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
const checkSubsequentPage = async (browser: Browser, url: string) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await browser.newPage();
	await loadPage(page, url);
	await checkCMPIsNotVisible(page);
	await checkTopAdHasLoaded(page);
};

const checkGpcRespected = async (page: Page, url: string) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	log_info(`GPC signal: Start`);

	await page.setExtraHTTPHeaders({
		'Sec-GPC': '1',
	});

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	const invokeUspApi = () => {
		return new Promise<UspData>((resolve) => {
			const uspApiCallback = (uspData: UspData) => {
				resolve(uspData);
			};

			if (typeof window.__uspapi === 'function') {
				window.__uspapi('getUSPData', 1, uspApiCallback);
			}
		});
	};

	const invokeUspApiResults = await page.evaluate(invokeUspApi);
	if (!invokeUspApiResults.gpcEnabled) {
		throw new Error('GPC Signal not respected!');
	}

	log_info(`GPC signal respected : Completed`);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const checkPages = async (config: Config, url: string, nextUrl: string) => {
	log_info(`Start checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(config.debugMode);
	const page: Page = await browser.newPage();

	// Clear cookies before starting testing, to ensure the CMP is displayed.
	const client = await page.target().createCDPSession();
	await clearCookies(client);

	await loadPage(page, url);

	await checkTopAdHasLoaded(page);

	await checkCMPIsOnPage(page);

	await clickDoNotSellMyInfo(config, page);

	await checkCMPIsNotVisible(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	await checkGpcRespected(page, url);

	if (nextUrl) {
		await checkSubsequentPage(browser, nextUrl);
	}

	await browser.close();
};

export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage (ccpa)');
	await checkPages(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
	);
	await checkPages(config, `${config.articleUrl}?adtest=fixed-puppies`, '');
};
