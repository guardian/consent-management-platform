import {
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from "../utils/browser-utils.js";
import {
	clickBannerButton,
	clickCancelSecondLayer,
	clickSaveAndCloseSecondLayer,
	clickToggleSecondLayer,
	openPrivacySettingsPanel,
} from "../utils/cmp-actions.js";
import {
	checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkPrivacySettingsPanelIsClosed,
	checkPrivacySettingsPanelIsOpen,
	checkTopAdDidNotLoad,
} from "../utils/cmp-checks.js";
import {
	BannerInteractions,
	ELEMENT_ID,
	JURISDICTIONS,
	STAGES,
} from "../utils/constants.js";
import { Log } from "../utils/log.js";
import { appendQueryParams, constructFrontsUrl } from "../utils/url-builder.js";

export const mainCheck = async (browserType, config) => {
	Log.info("Main check for AUS: Start");

	// Check the front page and subsequent article page for CODE and PROD
	if (config.stage !== STAGES.LOCAL) {
		await checkPages({
			browserType,
			config,
			url: constructFrontsUrl(config.frontUrl, JURISDICTIONS.AUS, config),
			nextUrl: appendQueryParams(config.articleUrl, config),
		});
	}

	// Check the article page
	await checkPages({
		browserType,
		config,
		url: appendQueryParams(config.articleUrl, config),
	});

	// check the privacy manager
	await testPrivacyManager(browserType, config);

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
const checkPages = async ({ browserType, config, url, nextUrl }) => {
	const browser = await makeNewBrowser(browserType, config.debugMode);
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

/**
 * @summary The testPrivacyManagerPanel launches a new browser and checks
 * that clicking 'Privacy settings' opens the privacy manager panel and
 * closes the cookie banner
 *
 * @param {*} browserType
 * @param {*} config
 */
export const testPrivacyManager = async (browserType, config) => {
	Log.info("Test privacy manager: Start");
	const browser = await makeNewBrowser(browserType, config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);
	const url = appendQueryParams(config.frontUrl, config);
	await loadPage(page, url);

	// Clear cookies and storage to ensure the banner is shown
	await context.clearCookies();
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	// Open Privacy Manager: check that CMP is not visible and Pricacy Manager is visible
	await openPrivacySettingsPanel(
		page,
		ELEMENT_ID.AUS_FIRST_LAYER_PRIVACY_SETTINGS,
	);
	await checkCMPIsNotVisible(page);
	await checkPrivacySettingsPanelIsOpen(
		page,
		ELEMENT_ID.AUS_SECOND_LAYER_SRC,
	);

	// Cancel Privacy Manager: check that CMP is visible and Privacy Manager is not visible
	await clickCancelSecondLayer(
		page,
		config.iframeDomainUrl,
		ELEMENT_ID.AUS_SECOND_LAYER_SRC,
		ELEMENT_ID.AUS_SECOND_LAYER_CANCEL,
	);
	await checkCMPIsOnPage(page);
	await checkPrivacySettingsPanelIsClosed(
		page,
		ELEMENT_ID.AUS_SECOND_LAYER_SRC,
	);

	// Open Privacy Manager, change toggle and click Save and Close
	await openPrivacySettingsPanel(
		page,
		ELEMENT_ID.AUS_FIRST_LAYER_PRIVACY_SETTINGS,
	);
	await clickToggleSecondLayer(
		page,
		config.iframeDomainUrl,
		ELEMENT_ID.AUS_SECOND_LAYER_SRC,
		"off",
	);
	await clickSaveAndCloseSecondLayer(
		config,
		page,
		ELEMENT_ID.AUS_SECOND_LAYER_SRC,
		ELEMENT_ID.AUS_SECOND_LAYER_SAVE_AND_EXIT,
	);
	await reloadPage(page);
	await checkCMPIsNotVisible(page);
	await checkTopAdDidNotLoad(page);

	await page.close();
	await browser.close();
	Log.info("Test privacy manager: Complete");
};
