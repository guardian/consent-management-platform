import type { Browser, BrowserContext, Page } from 'playwright-core';
import { BannerInteractions, type BannerInteraction, type Config } from '../types';
import {
	// checkAds,
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	// checkCMPLoadingTimeAndVersion,
	// checkGoogleAdManagerRequestIsMade,
	// checkPrivacySettingsPanelIsOpen,
	checkTopAdDidNotLoad,
	checkTopAdHasLoaded,
	clearCookies,
	clearLocalStorage,
	clickAcceptAllCookies,
	clickBannerButton,
	// clickRejectAll,
	// clickRejectAllSecondLayer,
	// clickSaveAndCloseSecondLayer,
	dropCookiesForNonAdvertisingBanner,
	loadPage,
	log_info,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	// openPrivacySettingsPanel,
	reloadPage,
} from './common-functions';



const BannerType = {
	CONSENT_OR_PAY_SIGNED_IN: 'consent_or_pay_signed_in',
	CONSENT_OR_PAY_SIGNED_OUT: 'consent_or_pay_signed_out',
	NON_ADVERTISING: 'non_advertising',
} as const;

type Banner = (typeof BannerType)[keyof typeof BannerType];

const isUsingNonPersonalisedAds = async (page: Page): Promise<void> => {
	await checkTopAdDidNotLoad(page);
	// TODO: Check the optout advertising url is called
};

const isUsingPersonalisedAds = async (page: Page): Promise<void> => {
	await checkTopAdHasLoaded(page);
	// TODO: Check opt out is not loaded.
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 *
 * @param {BrowserContext} context
 * @param {Config} config
 * @param {string} url
 */
const checkSubsequentPage = async (
	context: BrowserContext,
	config: Config,
	url: string,
	isNonAdvertisingBanner: boolean,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await makeNewPage(context);
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkCMPIsNotVisible(page);

	if (isNonAdvertisingBanner) {
		await isUsingNonPersonalisedAds(page);
	} else {
		await isUsingPersonalisedAds(page);
	}

	await Promise.all([clearCookies(page), clearLocalStorage(page)]);
	await reloadPage(page);
	await isUsingNonPersonalisedAds(page);
	await clickAcceptAllCookies(config, page, "Yes I'm Happy");
	await Promise.all([
		checkCMPIsNotVisible(page),
		isUsingPersonalisedAds(page),
	]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */

const setupPage = async (
	config: Config,
	bannerType: Banner,
): Promise<{ page: Page; browser: Browser; context: BrowserContext }> => {
	const browser: Browser = await makeNewBrowser(config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	if (bannerType === BannerType.NON_ADVERTISING) {
		await dropCookiesForNonAdvertisingBanner(page);
	}

	return {
		page,
		browser,
		context,
	};
};

/**
 * User who is paying for a subscription that allows them to view the site without google ad manager and
 * with a non-advertising banner.
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 */
const checkNonAdvertisingBanner = async (
	config: Config,
	url: string,
	nextUrl: string,
	bannerInteraction: BannerInteraction,
) => {
	log_info('checkPage non advertising banner');
	// Testing the non advertising banner
	const { browser, page, context } = await setupPage(
		config,
		BannerType.NON_ADVERTISING,
	);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await checkTopAdDidNotLoad(page);

	switch (bannerInteraction) {
		case BannerInteractions.ACCEPT_ALL:
			await clickBannerButton(page, 'Accept all', BannerInteractions.ACCEPT_ALL);

			await checkCMPIsNotVisible(page);

			await isUsingNonPersonalisedAds(page);
			break;
		case BannerInteractions.REJECT_ALL:
			await clickBannerButton(page, 'Reject all', BannerInteractions.REJECT_ALL);
			await checkCMPIsNotVisible(page);
			await isUsingNonPersonalisedAds(page);
			break;
	}

	if (nextUrl) {
		await checkSubsequentPage(context, config, nextUrl, true);
	}

	await page.close();
	await browser.close();
};

/**
 * User who is paying for a subscription that allows them to view the site without google ad manager and
 * with a non-advertising banner.
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 */
// const checkConsentOrPaySignedOutBanner = async (
// 	config: Config,
// 	url: string,
// 	nextUrl: string,
// 	bannerInteraction: BannerInteraction,
// ) => {
// 	log_info('checkPage Consent or Pay Signed Out user');
// 	// Testing the non advertising banner
// 	const { browser, page, context } = await setupPage(
// 		config,
// 		BannerType.CONSENT_OR_PAY_SIGNED_OUT,
// 	);

// 	await loadPage(page, url);

// 	await checkCMPIsOnPage(page);

// 	await checkTopAdDidNotLoad(page);

// 	switch (bannerInteraction) {
// 		case BannerInteractions.ACCEPT_ALL:
// 			await clickAcceptAllCookies(config, page, 'Accept all');

// 			await checkCMPIsNotVisible(page);

// 			await isUsingNonPersonalisedAds(page);
// 			break;
// 		case BannerInteractions.REJECT_AND_SUBSCRIBE:
// 			await clickRejectAll(config, page, 'Reject all');
// 			await checkCMPIsNotVisible(page);
// 			await isUsingNonPersonalisedAds(page);
// 			break;
// 	}

// 	if (nextUrl) {
// 		await checkSubsequentPage(context, config, nextUrl, true);
// 	}

// 	await page.close();
// 	await browser.close();
// };

/**
 * This is the function tests the page for two different scenarios:
 * 1. A user visits the home page (uses the frontend repo) and navigates
 * to an article page (uses dotcom-rendering)
 * 2. A user visit only the article page
 *
 * @param {Config} config
 * @return {*}  {Promise<void>}
 */
export const mainCheck = async function (config: Config): Promise<void> {
	log_info('checkPage consent or pay (tcfv2)');
	// Testing the consent or pay banner
	// Clicking accept all will do this
	// Clicking reject and subscribe will do that

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.ACCEPT_ALL,
	);

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.REJECT_ALL,
	);
};
