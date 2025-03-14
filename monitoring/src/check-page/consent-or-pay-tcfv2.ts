import type { Browser, BrowserContext, Page } from 'playwright-core';
import {
	type BannerInteraction,
	BannerInteractions,
	type Config,
	ELEMENT_ID,
} from '../types';
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdDidNotLoad,
	checkTopAdHasLoaded,
	clearCookies,
	clearLocalStorage,
	clickAcceptAllCookies,
	clickBannerButton,
	clickSaveAndCloseSecondLayer,
	dropCookiesForNonAdvertisingBanner,
	dropCookiesForSignedInUser,
	loadPage,
	log_info,
	log_line,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from './common-functions';

const BannerType = {
	CONSENT_OR_PAY_SIGNED_IN: 'consent_or_pay_signed_in',
	CONSENT_OR_PAY_SIGNED_OUT: 'consent_or_pay_signed_out',
	NON_ADVERTISING: 'non_advertising',
} as const;

type Banner = (typeof BannerType)[keyof typeof BannerType];

const loginUser = async (page: Page) => {
	log_info('Logging in user: Start');
	const profileResponse = {
		status: 'ok',
		userProfile: {
			userId: '102309223',
			displayName: 'Guardian User',
			webUrl: 'https://profile.theguardian.com/user/id/102309223',
			apiUrl: 'https://discussion.guardianapis.com/discussion-api/profile/102309223',
			avatar: 'https://avatar.guim.co.uk/user/102309223',
			secureAvatarUrl: 'https://avatar.guim.co.uk/user/102309223',
			badge: [],
			privateFields: {
				canPostComment: true,
				isPremoderated: false,
				hasCommented: false,
			},
		},
	};

	const idapiIdentifiersResponse = {
		id: '000000000',
		brazeUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
		puzzleUuid: 'aaaaaaaaaaaa',
		googleTagId: 'aaaaaaaaaaaa',
	};

	await page.route(
		'**/user/me/identifiers',
		(route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify(idapiIdentifiersResponse),
			});
		},
	)

	await page.route(
		'**/profile/me?strict_sanctions_check=false',
		(route) => {
			route.fulfill({
				status: 200,
				body: JSON.stringify(profileResponse),
			});
		},
	)

	page.route(
		'**/signin',
		(route) => {
			route.abort();
		}
	);

	log_info('Logging in user: Complete');
};

/**
 * Checks that the optout ads request is made
 *
 * @param {Page} page
 */
const checkOptOutLoads = async (page: Page) => {
	log_info('Checking opt out loads: start');
	await page.waitForRequest(/cdn\.optoutadvertising\.com/);
	log_info('Checked opt out loads: complete');
};

/**
 * Checks that only optout ads load on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
const isUsingNonPersonalisedAds = async (page: Page): Promise<void> => {
	await checkTopAdDidNotLoad(page);
	await checkOptOutLoads(page);
};

/**
 * Checks that personalised ads load on the page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
const isUsingPersonalisedAds = async (page: Page): Promise<void> => {
	await checkTopAdHasLoaded(page);
	// TODO: Check opt out is not loaded.
};

/**
 * Opens privacy settings panel for Consent or Pay users
 *
 * @param {Page} page
 * @param {Config} config
 */
const openReducedPrivacySettingsPanel = async (page: Page) => {
	log_info(`Loading reduced privacy settings panel: Start`);
	const privacySettingsLink = page
		.frameLocator(ELEMENT_ID.CMP_CONTAINER)
		.locator('p.gu-partners-link-wrapper u a')
		.first();

	await privacySettingsLink.waitFor({ state: 'visible' });

	await privacySettingsLink.click();

	log_info(`Loading reduced privacy settings panel: Complete`);
};

/**
 * Checks that the privacy settings panel is open
 *
 * @param {Page} page
 * @param {Config} config
 */
const checkReducedPrivacySettingsPanelIsOpen = (
	page: Page,
	config: Config,
) => {
	log_info(`Checking that the reduced privacy settings panel is open: Start`);
	page.frameLocator(
		'[src*="' + config.iframeDomainSecondLayer + '"]',
	).locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	log_info(
		`Checking that the reduced privacy settings panel is open: Complete`,
	);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */
const setupPage = async (
	config: Config,
	bannerType: Banner,
): Promise<{ page: Page; browser: Browser; context: BrowserContext }> => {
	log_info('Setting up page: Start');
	const browser: Browser = await makeNewBrowser(config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	if (bannerType === BannerType.NON_ADVERTISING) {
		await dropCookiesForNonAdvertisingBanner(page);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		await dropCookiesForSignedInUser(page);
		await loginUser(page);
	}

	log_info('Setting up page: Complete');

	return {
		page,
		browser,
		context,
	};
};

/**
 * This checks that the sign in link is on the CMP
 *
 * @param {Page} page
 */
const checkSignInLinkIsOnCMP = async (page: Page) => {
	log_info('Checking that the sign in link is on the CMP: Start');
	(
		await page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.CMP_ACTIONS_ROW)
			.allInnerTexts()
	).includes('sign in');
	log_info('Checking that the sign in link is on the CMP: Complete');

};

/**
 * This checks that the user was redirected to the guardian ad lite page
 *
 * @param {Page} page
 */
const checkWasRedirectedToGuardianLite = async (page: Page) => {
	log_info(
		'Checking that the user was redirected to the guardian ad lite page: Start',
	);
	await page.waitForURL('**/guardian-ad-lite?returnAddress=*');
	log_info(
		'Checked that the user was redirected to the guardian ad lite page: Complete',
	);
};

/**
 * User who is paying for a subscription that allows them to view the site without google ad manager and
 * with a non-advertising banner.
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 */
const checkConsentOrPayBanner = async (
	config: Config,
	url: string,
	nextUrl: string,
	bannerInteraction: BannerInteraction,
	bannerType: Banner,
) => {
	await checkConsentOrPayFirstLayer(
		config,
		url,
		nextUrl,
		bannerInteraction,
		bannerType,
	);

	await checkConsentOrPaySecondLayer(config, url, bannerType);
};

/**
 * Accepts all in the reduced privacy settings panel
 *
 * @param {Page} page
 * @param {Config} config
 */
const acceptAllInReducedPrivacySettingsPanel = async (
	page: Page,
	config: Config,
) => {
	log_info('Accepting all in reduced privacy settings panel: Start');
	// const storeAccessInformationButton = await page.frameLocator('[src*="' + config.iframeDomainSecondLayer + '"]').locator("div.type-box  div.stack-row  div.tcfv2-stack  div.pur-buttons-container button:first-child");

	const buttons = page
		.frameLocator(`[src*="${config.iframeDomainSecondLayer}"]`)
		.locator(
			'div.type-box div.stack-row div.pur-buttons-container button:first-child',
		);
	const count = 3;
	for (let i = 0; i < count; i++) {
		await buttons.nth(i).waitFor({ state: 'visible' });
		await buttons.nth(i).click();
	}

	log_info('Accepting all in reduced privacy settings panel: Complete');
};

/**
 * Checks the first layer of the Consent or Pay banner
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 * @param {BannerInteraction} bannerInteraction
 * @param {Banner} bannerType
 */
const checkConsentOrPayFirstLayer = async (
	config: Config,
	url: string,
	nextUrl: string,
	bannerInteraction: BannerInteraction,
	bannerType: Banner,
) => {
	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		log_info(
			'Checking first layer - Consent or Pay banner (signed in): Start',
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		log_info(
			'Checking first layer - Consent or Pay banner (signed out): Start',
		);
	}

	const { browser, page, context } = await setupPage(config, bannerType);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		await checkSignInLinkIsOnCMP(page);
	}

	await checkTopAdDidNotLoad(page);

	switch (bannerInteraction) {
		case BannerInteractions.ACCEPT_ALL:
			await clickBannerButton(
				page,
				'Accept all',
				BannerInteractions.ACCEPT_ALL,
			);

			await checkCMPIsNotVisible(page);

			await isUsingPersonalisedAds(page);
			break;
		case BannerInteractions.REJECT_AND_SUBSCRIBE:
			await clickBannerButton(
				page,
				'Reject and Subscribe',
				BannerInteractions.REJECT_AND_SUBSCRIBE,
			);

			await checkWasRedirectedToGuardianLite(page);
			break;
	}

	if (nextUrl) {
		await checkSubsequentPage(context, config, nextUrl, bannerType);
	}

	await page.close();
	await browser.close();

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		log_info(
			'Checking first layer - Consent or Pay banner (signed in): Complete',
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		log_info(
			'Checking first layer - Consent or Pay banner (signed out): Complete',
		);
	}
};

/**
 * Checks the second layer of the Consent or Pay banner
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 * @param {BannerInteraction} bannerInteraction
 * @param {Banner} bannerType
 */
const checkConsentOrPaySecondLayer = async (
	config: Config,
	url: string,
	bannerType: Banner,
) => {
	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		log_info('checking second layer: Consent or Pay banner (signed in)');
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		log_info('checking second layer:  Consent or Pay banner (signed out)');
	}

	const { browser, page } = await setupPage(config, bannerType);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await openReducedPrivacySettingsPanel(page);

	checkReducedPrivacySettingsPanelIsOpen(page, config);

	// await clickSaveAndCloseSecondLayer(config, page);

	checkReducedPrivacySettingsPanelIsOpen(page, config);

	await acceptAllInReducedPrivacySettingsPanel(page, config);

	await clickSaveAndCloseSecondLayer(config, page);

	await isUsingPersonalisedAds(page);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	await isUsingPersonalisedAds(page);

	await page.close();
	await browser.close();

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		log_info(
			'Checking second layer - Consent or Pay banner (signed in): Complete',
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		log_info(
			'Checking second layer - Consent or Pay banner (signed out): Complete',
		);
	}
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
	log_info('Checking non advertising banner: Start');

	const { browser, page, context } = await setupPage(
		config,
		BannerType.NON_ADVERTISING,
	);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await checkTopAdDidNotLoad(page);

	switch (bannerInteraction) {
		case BannerInteractions.ACCEPT_ALL:
			await clickBannerButton(
				page,
				'Accept all',
				BannerInteractions.ACCEPT_ALL,
			);

			await checkCMPIsNotVisible(page);

			await isUsingNonPersonalisedAds(page);
			break;
		case BannerInteractions.REJECT_ALL:
			await clickBannerButton(
				page,
				'Reject all',
				BannerInteractions.REJECT_ALL,
			);
			await checkCMPIsNotVisible(page);
			await isUsingNonPersonalisedAds(page);
			break;
	}

	if (nextUrl) {
		await checkSubsequentPage(
			context,
			config,
			nextUrl,
			BannerType.NON_ADVERTISING,
		);
	}

	await page.close();
	await browser.close();
	log_info('Checking non advertising banner: Complete');

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
	bannerType: Banner,
) => {
	log_info(`Start checking subsequent Page URL: ${url}`);
	const page: Page = await makeNewPage(context);
	await loadPage(page, url);
	// There is no CMP since this we have already accepted this on a previous page.
	await checkCMPIsNotVisible(page);

	switch (bannerType) {
		case BannerType.CONSENT_OR_PAY_SIGNED_IN:
			await isUsingPersonalisedAds(page);
			break;
		case BannerType.CONSENT_OR_PAY_SIGNED_OUT:
			await isUsingPersonalisedAds(page);
			break;
		case BannerType.NON_ADVERTISING:
			await isUsingNonPersonalisedAds(page);
			break;
	}

	await Promise.all([clearCookies(page), clearLocalStorage(page)]);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickAcceptAllCookies(config, page, "Yes I'm Happy");
	await Promise.all([
		checkCMPIsNotVisible(page),
		isUsingPersonalisedAds(page),
	]);
	await page.close();
	log_info(`Checking subsequent Page URL: ${url} Complete`);
};

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
	await checkConsentOrPayBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.ACCEPT_ALL,
		BannerType.CONSENT_OR_PAY_SIGNED_OUT,
	);
	log_line();

	await checkConsentOrPayBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		``,
		BannerInteractions.REJECT_AND_SUBSCRIBE,
		BannerType.CONSENT_OR_PAY_SIGNED_OUT,
	);
	log_line();

	// await checkConsentOrPayBanner(
	// 	config,
	// 	`${config.frontUrl}?adtest=fixed-puppies`,
	// 	`${config.articleUrl}?adtest=fixed-puppies`,
	// 	BannerInteractions.ACCEPT_ALL,
	// 	BannerType.CONSENT_OR_PAY_SIGNED_IN,
	// );
	// log_line();

	// await checkConsentOrPayBanner(
	// 	config,
	// 	`${config.articleUrl}?adtest=fixed-puppies`,
	// 	``,
	// 	BannerInteractions.REJECT_AND_SUBSCRIBE,
	// 	BannerType.CONSENT_OR_PAY_SIGNED_IN,
	// );
	// log_line();

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.ACCEPT_ALL,
	);
	log_line();

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.REJECT_ALL,
	);
	log_line();
};
