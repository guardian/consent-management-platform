import {
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from "../utils/browser-utils";
import { clickBannerButton } from "../utils/cmp-actions";
import { checkAds, checkCMPIsNotVisible, checkCMPIsOnPage } from "../utils/cmp-checks";
import { BannerInteractions } from "../utils/constants";
import { Log } from "../utils/log";


export const mainCheck = async (config) => {
	Log.info("Main check for AUS: Start");

	// Check the front page and subsequent article page
	await checkPages({
		config,
		url: `${config.frontUrl}?adtest=fixed-puppies`,
		nextUrl: `${config.articleUrl}?adtest=fixed-puppies`,
	});

	// Check the article page
	await checkPages({
		config,
		url: `${config.articleUrl}?adtest=fixed-puppies`,
	});

	Log.info("Main check for AUS: Complete");
};

/**
 * @summary This checks that user consent persists
 * when navigating to a subsequent page. It opens a
 * new page within the given browser context, loads the
 * specified URL, and verifies that the CMP is no longer
 * visible and that ads are correctly displayed.
 *
 * @param {*} context
 * @param {*} url
 */
const checkSubsequentPage = async (context, url) => {
	Log.info(`Start checking subsequent Page URL: ${url}`);
	const page = await makeNewPage(context);
	await loadPage(page, url);
	await Promise.all([checkCMPIsNotVisible(page), checkAds(page)]);
	await page.close();
	Log.info(`Checking subsequent Page URL: ${url} Complete`);
};

/**
 * @summary The checkPages function performs an end-to-end
 * test of CMP  and ad behavior during a browser session.
 * It launches a new browser, navigates to a specified URL,
 * verifies the presence of the CMP, tests user interactions
 * via the "Continue" button, and ensures the CMP is dismissed.
 * It then reloads the page to confirm ads load as expected.
 * If a nextUrl is provided, it checks if the consent
 * persists and ad behavior on the subsequent page.
 *
 * @param {*} { config, url, nextUrl }
 */
const checkPages = async ({ config, url, nextUrl }) => {
	const browser = await makeNewBrowser(config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);
	await clickBannerButton(page, "Continue", BannerInteractions.ACCEPT_ALL);
	await checkCMPIsNotVisible(page);
	await reloadPage(page);
	await checkAds(page);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

	await page.close();
	await browser.close();
};
