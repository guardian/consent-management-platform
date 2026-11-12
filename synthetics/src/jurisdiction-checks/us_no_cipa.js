import {
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
} from "../utils/browser-utils.js";
import {
	checkAds,
	checkCMPIsNotVisible,
	checkGPCBanner,
	checkGPCRespected,
} from "../utils/cmp-checks.js";
import { JURISDICTIONS } from "../utils/constants.js";
import { Log } from "../utils/log.js";
import { appendQueryParams, constructFrontsUrl } from "../utils/url-builder.js";

export const mainCheck = async (browserType, config) => {
	Log.info("Main check for US No CIPA: Start");
	await checkGPCBanner(
		browserType,
		config,
		constructFrontsUrl(
			config.frontUrl,
			JURISDICTIONS.USNAT_NO_CIPA,
			config,
		),
	);
	await checkPages({
		browserType,
		config,
		url: constructFrontsUrl(
			config.frontUrl,
			JURISDICTIONS.USNAT_NO_CIPA,
			config,
		),
		nextUrl: appendQueryParams(config.articleUrl, config),
		isAmp: false,
	});
};

export const checkPages = async ({ browserType, config, url, nextUrl }) => {
	const browser = await makeNewBrowser(browserType, config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	await loadPage(page, url);

	await checkAds(page);

	await checkCMPIsNotVisible(page);
	if (nextUrl) {
		await checkSubsequentPage(context, nextUrl);
	}

	await checkGPCRespected(page);

	await page.close();
	await browser.close();
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
