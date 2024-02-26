import { Browser, BrowserContext, Page } from "playwright-core";
import { checkCMPIsOnPage, clickAcceptAllCookies, loadPage, log_info, makeNewBrowser, makeNewPage } from "./consumer-self-test-commons";

/**
 * Creates a browser and page.
 * Performs the tests for each layer.
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 */
const checkFirstPage = async (url: string) => {
	log_info(`self-check - checking Page URL: ${url}`);

	const browser: Browser = await makeNewBrowser(true);
	const context = await browser.newContext();
	const page = await makeNewPage(context);

	await firstLayerCheck(url, page, context);

	await page.close();
	await browser.close();
};

/**
 *
 * This function performs a series of tests to check
 * the first panel.
 *
 * @param {Config} config
 * @param {string} url
 * @param {Page} page
 * @param {Browser} browser
 * @param {string} nextUrl
 * @return {*}  {Promise<void>}
 */
 const firstLayerCheck = async function (
	url: string,
	page: Page,
	context: BrowserContext,
): Promise<void> {
	log_info('Checking first layer: Start');

	// Testing the Accept All button hides the CMP and loads Ads
	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	// await checkTopAdDidNotLoad(page);

	await clickAcceptAllCookies(page, "Yes I'm Happy");

	// await checkCMPIsNotVisible(page);

	// await checkTopAdHasLoaded(page);

	// await reloadPage(page);

	// await checkTopAdHasLoaded(page);

	// await checkCMPIsNotVisible(page);

	log_info('Checking first layer: Complete');
};

export async function selfTest(url: string){

	try {
		console.log('(cmp-self-test) Starting)');
		await checkFirstPage(url);
		console.log('(cmp-self-test) Finished successfully');
		process.exit(0);
	} catch (error) {
		let errorMessage = 'Unknown Error!';

		if (typeof error === 'string') {
			errorMessage = error;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		console.log(`(cmp-self-test) Finished with failure: ${errorMessage}`);

		process.exit(1);
	}
};

// void selfTest();
