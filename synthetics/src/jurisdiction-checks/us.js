import {
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
} from "../utils/browser-utils.js";
import { clickBannerButton } from "../utils/cmp-actions.js";
import {
	checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkGPCRespected,
} from "../utils/cmp-checks.js";
import { BannerInteractions } from "../utils/constants.js";
import { Log } from "../utils/log.js";

export const mainCheck = async (browserType, config) => {
	Log.info("Main check for US: Start");
	// Check the front page and subsequent article page
	await checkPages({
		browserType,
		config,
		url: `${config.frontUrl}?adtest=fixed-puppies`,
		nextUrl: `${config.articleUrl}?adtest=fixed-puppies`,
		isAmp: false,
	});

	// Check the article page
	await checkPages({
		browserType,
		config,
		url: `${config.articleUrl}?adtest=fixed-puppies`,
		isAmp: false,
	});

	Log.info("Main check for US: Complete");
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
 * @summary  Tests the US CMP  and ad behavior during a
 * browser session. It launches a new browser, navigates
 * to a specified URL, checks the presence of the CMP,
 * simulates user consent via the "Do Not Sell or Share" button, and
 * ensures the CMP is dismissed. It then reloads the page to
 * confirm ads load as expected. If a nextUrl is provided,
 * it proceeds to check that the consent persists and ads are displayed
 * on the subsequent page.
 *
 * @param {*} { config, url, nextUrl }
 */
const checkPages = async ({ browserType, config, url, nextUrl }) => {
	const browser = await makeNewBrowser(browserType, config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	await loadPage(page, url);

	await checkAds(page);

	await checkCMPIsOnPage(page);

	await clickBannerButton(
		page,
		"Do not sell or share my personal information",
		BannerInteractions.DO_NOT_SELL,
	);

	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

	await checkGPCRespected(page);

	await page.close();
	await browser.close();
};
