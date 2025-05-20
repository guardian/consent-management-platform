import {
	clearCookies,
	clearLocalStorage,
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from "../utils/browser-utils.js";
import {
	checkPrivacySettingsPanelIsOpen,
	clickBannerButton,
	clickSaveAndCloseSecondLayer,
	openPrivacySettingsPanel,
} from "../utils/cmp-actions.js";
import {
	checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdDidNotLoad,
	checkTopAdHasLoaded,
} from "../utils/cmp-checks.js";
import { BannerInteractions } from "../utils/constants.js";
import { Log } from "../utils/log.js";

export const mainCheck = async (browserType, config) => {
	Log.info("Main check for TCFV2: Start");

	// Check the front page and subsequent article page
	await checkPages({
		browserType,
		config,
		url: `${config.frontUrl}?adtest=fixed-puppies`,
		nextUrl: `${config.articleUrl}?adtest=fixed-puppies`,
	});
	// Check the article page
	await checkPages({
		browserType,
		config,
		url: `${config.articleUrl}?adtest=fixed-puppies`,
	});

	Log.info("Main check for TCFV2: Complete");
};

const checkPages = async ({ browserType, config, url, nextUrl }) => {
	Log.info("Main check for TCFV2: Start");

	const browser = await makeNewBrowser(browserType, config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	await firstLayerCheck({
		config,
		url,
		context,
		page,
		nextUrl,
	});

	await page.close();
	await browser.close();

	const browserForSecondLayer = await makeNewBrowser(browserType, config.debugMode);
	const contextForSecondLayer = await makeNewContext(browserForSecondLayer);
	const pageForSecondLayer = await makeNewPage(contextForSecondLayer);

	await secondLayerCheck({
		config,
		url,
		page: pageForSecondLayer,
	});

	await rejectAllCheck({
		config,
		url,
		page: pageForSecondLayer,
	});

	await pageForSecondLayer.close();
	await browserForSecondLayer.close();
	Log.info("Main check for TCFV2: Complete");
};

/**
 * @summary The checkSubsequentPage function verifies consent
 * persistence and ad behavior when navigating to a new page
 * after initial consent has been given. It confirms that the
 * CMP does not appear, ads are properly loaded, and that clearing
 * cookies and local storage resets consent.
 * After reloading, it checks that ads are blocked again,
 * simulating a fresh visit. It then reaccepts consent via the
 * banner and ensures the CMP remains hidden and ads display as expected.
 *
 * @param {*} context
 * @param {*} config
 * @param {*} url
 */
const checkSubsequentPage = async (context, config, url) => {
	Log.info(`Start checking subsequent Page URL: ${url}`);
	const page = await makeNewPage(context);
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkCMPIsNotVisible(page);
	await checkTopAdHasLoaded(page);
	await Promise.all([clearCookies(page), clearLocalStorage(page)]);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickBannerButton(
		page,
		"Yes I'm Happy",
		BannerInteractions.ACCEPT_ALL,
	);

	await Promise.all([checkCMPIsNotVisible(page), checkAds(page)]);
	await page.close();
	Log.info(`Checking subsequent Page URL: ${url} Complete`);
};

/**
 * The firstLayerCheck function tests the behavior of the first-layer
 * banner. It checks that the CMP appears on initial load, blocks ad
 * loading until consent is given, and behaves correctly after a user
 * accepts all cookies. The test confirms that the CMP disappears
 * post-consent, ads load properly, and consent persists after a
 * page reload. If a nextUrl is provided, it also checks that
 * the correct consent and ad behavior carry over to subsequent pages.
 *
 * @param {*} { config, url, context, page, nextUrl }
 */
const firstLayerCheck = async ({ config, url, context, page, nextUrl }) => {
	Log.info(`First layer check: Start`);
	await loadPage(page, url);
	await checkCMPIsOnPage(page);
	await checkTopAdDidNotLoad(page);
	await clickBannerButton(
		page,
		"Accept All Cookies",
		BannerInteractions.ACCEPT_ALL,
	);
	await checkCMPIsNotVisible(page);
	await checkAds(page);

	await reloadPage(page);

	await checkTopAdHasLoaded(page);

	await checkCMPIsNotVisible(page);

	if (nextUrl) {
		await checkSubsequentPage(context, config, nextUrl);
	}

	Log.info(`First layer check: Complete`);
};

const secondLayerCheck = async ({ config, url, page }) => {
	Log.info(`Second layer check: Start`);
	await loadPage(page, url);
	await checkCMPIsOnPage(page);
	await openPrivacySettingsPanel(page);
	await checkPrivacySettingsPanelIsOpen(config, page);
	await clickSaveAndCloseSecondLayer(config, page);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	await checkTopAdDidNotLoad(page);

	Log.info(`Second layer check: Complete`);
};

const rejectAllCheck = async ({ url, page }) => {
	Log.info(`Reject all check: Start`);
	await loadPage(page, url);
	await checkCMPIsOnPage(page);
	await clickBannerButton(
		page,
		"Reject All Cookies",
		BannerInteractions.REJECT_ALL,
	);
	await checkCMPIsNotVisible(page);
	await checkTopAdDidNotLoad(page);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	Log.info(`Reject all check: Complete`);
};
