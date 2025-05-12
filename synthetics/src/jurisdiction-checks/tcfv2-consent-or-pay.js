import {
	clearCookies,
	clearLocalStorage,
	dropCookiesForNonAdvertisingBanner,
	dropCookiesForSignedInUser,
	loadPage,
	makeNewBrowser,
	makeNewContext,
	makeNewPage,
	reloadPage,
} from "../utils/browser-utils";
import {
	clickBannerButton,
	clickSaveAndCloseSecondLayer,
} from "../utils/cmp-actions";
import {
	checkCMPIsNotVisible,
	checkCMPIsOnPage,
	checkTopAdDidNotLoad,
	isUsingNonPersonalisedAds,
	isUsingPersonalisedAds,
} from "../utils/cmp-checks";
import { BannerInteractions, ELEMENT_ID } from "../utils/constants";
import { Log } from "../utils/log";

const BannerType = {
	CONSENT_OR_PAY_SIGNED_IN: "consent_or_pay_signed_in",
	CONSENT_OR_PAY_SIGNED_OUT: "consent_or_pay_signed_out",
	NON_ADVERTISING: "non_advertising",
};

export const mainCheck = async (config) => {
	Log.info("Main check for TCFV2: Start");
	await checkConsentOrPayBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.ACCEPT_ALL,
		BannerType.CONSENT_OR_PAY_SIGNED_OUT,
	);
	Log.line();

	await checkConsentOrPayBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		``,
		BannerInteractions.REJECT_AND_SUBSCRIBE,
		BannerType.CONSENT_OR_PAY_SIGNED_OUT,
	);
	Log.line();

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.ACCEPT_ALL,
	);
	Log.line();

	await checkNonAdvertisingBanner(
		config,
		`${config.frontUrl}?adtest=fixed-puppies`,
		`${config.articleUrl}?adtest=fixed-puppies`,
		BannerInteractions.REJECT_AND_SUBSCRIBE,
	);

	Log.info("Main check for TCFV2: Complete");
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
	config,
	url,
	nextUrl,
	bannerInteraction,
	bannerType,
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
 * Checks the first layer of the Consent or Pay banner
 *
 * @param {Config} config
 * @param {string} url
 * @param {string} nextUrl
 * @param {BannerInteraction} bannerInteraction
 * @param {Banner} bannerType
 */
const checkConsentOrPayFirstLayer = async (
	config,
	url,
	nextUrl,
	bannerInteraction,
	bannerType,
) => {
	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		Log.info(
			"Checking first layer - Consent or Pay banner (signed in): Start",
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		Log.info(
			"Checking first layer - Consent or Pay banner (signed out): Start",
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
				"Accept all",
				BannerInteractions.ACCEPT_ALL,
			);

			await checkCMPIsNotVisible(page);

			await isUsingPersonalisedAds(page);
			break;
		case BannerInteractions.REJECT_AND_SUBSCRIBE:
			await clickBannerButton(
				page,
				"Reject and Subscribe",
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
		Log.info(
			"Checking first layer - Consent or Pay banner (signed in): Complete",
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		Log.info(
			"Checking first layer - Consent or Pay banner (signed out): Complete",
		);
	}
};

/**
 *
 *
 * @param {*} config
 * @param {*} url
 * @param {*} bannerType
 */
const checkConsentOrPaySecondLayer = async (config, url, bannerType) => {
	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		Log.info("checking second layer: Consent or Pay banner (signed in)");
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		Log.info("checking second layer:  Consent or Pay banner (signed out)");
	}

	const { browser, page } = await setupPage(config, bannerType);

	await loadPage(page, url);

	await checkCMPIsOnPage(page);

	await openReducedPrivacySettingsPanel(page);

	checkReducedPrivacySettingsPanelIsOpen(page, config);

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
		Log.info(
			"Checking second layer - Consent or Pay banner (signed in): Complete",
		);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_OUT) {
		Log.info(
			"Checking second layer - Consent or Pay banner (signed out): Complete",
		);
	}
};

const checkNonAdvertisingBanner = async (
	config,
	url,
	nextUrl,
	bannerInteraction,
) => {
	Log.info("Checking non advertising banner: Start");

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
				"Accept all",
				BannerInteractions.ACCEPT_ALL,
			);

			await checkCMPIsNotVisible(page);

			await isUsingNonPersonalisedAds(page, config.stage);
			break;
		case BannerInteractions.REJECT_ALL:
			await clickBannerButton(
				page,
				"Reject all",
				BannerInteractions.REJECT_ALL,
			);
			await checkCMPIsNotVisible(page);
			await isUsingNonPersonalisedAds(page, config.stage);

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
	Log.info("Checking non advertising banner: Complete");
};

/**
 * This checks that the sign in link is on the CMP
 *
 * @param {Page} page
 */
const checkSignInLinkIsOnCMP = async (page) => {
	Log.info("Checking that the sign in link is on the CMP: Start");
	(
		await page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator(ELEMENT_ID.CMP_ACTIONS_ROW)
			.allInnerTexts()
	).includes("sign in");
	Log.info("Checking that the sign in link is on the CMP: Complete");
};

/**
 * Checks that ads load correctly for the second page a user goes to
 * when visiting the site, with respect to and interaction with the CMP.
 *
 * @param {BrowserContext} context
 * @param {Config} config
 * @param {string} url
 */
const checkSubsequentPage = async (context, config, url, bannerType) => {
	Log.info(`Start checking subsequent Page URL: ${url}`);
	const page = await makeNewPage(context);
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
			await isUsingNonPersonalisedAds(page, config.stage);
			break;
	}

	await Promise.all([clearCookies(page), clearLocalStorage(page)]);
	await reloadPage(page);
	await checkTopAdDidNotLoad(page);
	await clickBannerButton(
		page,
		"Yes I'm Happy",
		BannerInteractions.ACCEPT_ALL,
	);
	await Promise.all([
		checkCMPIsNotVisible(page),
		isUsingPersonalisedAds(page),
	]);
	await page.close();
	Log.info(`Checking subsequent Page URL: ${url} Complete`);
};

/**
 * Checks that ads load correctly for the first time a user goes to
 * the site, with respect to and interaction with the CMP.
 */
const setupPage = async (config, bannerType) => {
	Log.info("Setting up page: Start");
	const browser = await makeNewBrowser(config.debugMode);
	const context = await makeNewContext(browser);
	const page = await makeNewPage(context);

	if (bannerType === BannerType.NON_ADVERTISING) {
		await dropCookiesForNonAdvertisingBanner(page);
	}

	if (bannerType === BannerType.CONSENT_OR_PAY_SIGNED_IN) {
		await dropCookiesForSignedInUser(page);
		await loginUser(page);
	}

	Log.info("Setting up page: Complete");

	return {
		page,
		browser,
		context,
	};
};

/**
 * @summary This checks that the user was redirected to the guardian ad lite page
 *
 * @param  page
 */
const checkWasRedirectedToGuardianLite = async (page) => {
	Log.info(
		"Checking that the user was redirected to the guardian ad lite page: Start",
	);
	await page.waitForURL("**/guardian-ad-lite?returnAddress=*");
	Log.info(
		"Checked that the user was redirected to the guardian ad lite page: Complete",
	);
};

const loginUser = async (page) => {
	Log.info("Logging in user: Start");
	const profileResponse = {
		status: "ok",
		userProfile: {
			userId: "102309223",
			displayName: "Guardian User",
			webUrl: "https://profile.theguardian.com/user/id/102309223",
			apiUrl: "https://discussion.guardianapis.com/discussion-api/profile/102309223",
			avatar: "https://avatar.guim.co.uk/user/102309223",
			secureAvatarUrl: "https://avatar.guim.co.uk/user/102309223",
			badge: [],
			privateFields: {
				canPostComment: true,
				isPremoderated: false,
				hasCommented: false,
			},
		},
	};

	const idapiIdentifiersResponse = {
		id: "000000000",
		brazeUuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		puzzleUuid: "aaaaaaaaaaaa",
		googleTagId: "aaaaaaaaaaaa",
	};

	await page.route("**/user/me/identifiers", async (route) => {
		await route.fulfill({
			status: 200,
			body: JSON.stringify(idapiIdentifiersResponse),
		});
	});

	await page.route(
		"**/profile/me?strict_sanctions_check=false",
		async (route) => {
			await route.fulfill({
				status: 200,
				body: JSON.stringify(profileResponse),
			});
		},
	);

	await page.route("**/signin", async (route) => {
		await route.abort();
	});

	Log.info("Logging in user: Complete");
};

/**
 * Opens privacy settings panel for Consent or Pay users
 *
 * @param {Page} page
 * @param {Config} config
 */
const openReducedPrivacySettingsPanel = async (page) => {
	Log.info(`Loading reduced privacy settings panel: Start`);
	const privacySettingsLink = page
		.frameLocator(ELEMENT_ID.CMP_CONTAINER)
		.locator("p.gu-partners-link-wrapper u a")
		.first();

	await privacySettingsLink.waitFor({ state: "visible" });

	await privacySettingsLink.click();

	Log.info(`Loading reduced privacy settings panel: Complete`);
};

/**
 * Checks that the privacy settings panel is open
 *
 * @param {Page} page
 * @param {Config} config
 */
const checkReducedPrivacySettingsPanelIsOpen = (page, config) => {
	Log.info(`Checking that the reduced privacy settings panel is open: Start`);
	page.frameLocator(
		'[src*="' + config.iframeDomainUrlSecondLayer + '"]',
	).locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);
	Log.info(
		`Checking that the reduced privacy settings panel is open: Complete`,
	);
};

const acceptAllInReducedPrivacySettingsPanel = async (page, config) => {
	Log.info("Accepting all in reduced privacy settings panel: Start");
	// const storeAccessInformationButton = await page.frameLocator('[src*="' + config.iframeDomainUrlSecondLayer + '"]').locator("div.type-box  div.stack-row  div.tcfv2-stack  div.pur-buttons-container button:first-child");

	const buttons = page
		.frameLocator(`[src*="${config.iframeDomainUrlSecondLayer}"]`)
		.locator(
			"div.type-box div.stack-row div.pur-buttons-container button:first-child",
		);
	const count = 3;
	for (let i = 0; i < count; i++) {
		await buttons.nth(i).waitFor({ state: "visible" });
		await buttons.nth(i).click();
	}

	Log.info("Accepting all in reduced privacy settings panel: Complete");
};
