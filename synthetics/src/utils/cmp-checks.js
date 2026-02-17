import { reloadPage } from "./browser-utils.js";
import { CURRENCY_SYMBOLS, ELEMENT_ID } from "./constants.js";
import { Log } from "./log.js";

/**
 * @summary Record the version of the Sourcepoint CMP
 *
 * @param {*} page
 */
export const recordVersionOfCMP = async (page) => {
	Log.info("* Getting the version of Sourcepoint CMP");

	const functionToGetVersion = function () {
		return window._sp_.version;
	};

	Log.info(await page.evaluate(functionToGetVersion));
};

/**
 * @summary This checks that the user was redirected to the guardian ad lite page
 *
 * @param  page
 */
export const checkWasRedirectedToGuardianLite = async (page) => {
	Log.info(
		"Checking that the user was redirected to the guardian ad lite page: Start",
	);
	// ********************* THE EURO AD-LITE PAGE DOESN'T YET EXIST
	await page.waitForURL("**/guardian-ad-lite?returnAddress=*");
	Log.info(page); // temporarily included to remove the lint error
	Log.info(
		"Checked that the user was redirected to the guardian ad lite page: Complete",
	);
};

/**
 * @summary This checks the banner reappears when using the browser back button
 *
 * @param {*} page
 */
export const checkBannerReappearsWhenBackingInBrowser = async (page) => {
	Log.info(
		"Checking that the banner reappears when navigating back in the browser: Start",
	);
	await page.waitForURL("**/guardian-ad-lite?returnAddress=*");
	await page.goBack();
	await checkCMPIsOnPage(page);
	Log.info(
		"Checked that the banner reappears when navigating back in the browser: Complete",
	);
};

/**
 * @summary Check if the CMP is present on the page
 *
 * @param {*} page
 */
export const checkCMPIsOnPage = async (page) => {
	Log.info(`Waiting for CMP: Start`);

	const cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER);

	await cmpl.waitFor();

	await recordVersionOfCMP(page);

	if (!(await cmpl.isVisible())) {
		throw Error("CMP is not present on page");
	}

	Log.info(`Waiting for CMP: Complete`);
};

/**
 * @summary Check if the CMP is not visible on the page
 *
 * @param {*} page
 */
export const checkCMPIsNotVisible = async (page) => {
	Log.info(`Checking CMP is Hidden: Start`);

	const cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER).first();

	try {
		// Wait for the CMP to become hidden with a timeout
		await cmpl.waitFor({ state: "hidden", timeout: 10000 });
	} catch (error) {
		if (error.name === "TimeoutError") {
			Log.error("CMP is still visible after timeout");
			throw Error("CMP still present on page");
		} else {
			throw error;
		}
	}

	Log.info("CMP hidden or removed from page");
};

/**
 * @summary Check if the top ad has loaded
 *
 * @param {*} page
 */
export const checkTopAdHasLoaded = async (page) => {
	Log.info(`Waiting for interaction with GAM: Start`);

	const gamUrl = /https:\/\/securepubads.g.doubleclick.net\/gampad\/ads/;

	const getEncodedParamsFromRequest = (request, paramName) => {
		const url = new URL(request.url());
		const param = url.searchParams.get(paramName);
		if (!param) {
			return null;
		}
		const paramDecoded = decodeURIComponent(param);
		const searchParams = new URLSearchParams(paramDecoded);
		return searchParams;
	};

	const assertOnSlotFromRequest = (request, expectedSlot) => {
		const isURL = request.url().match(gamUrl);
		if (!isURL) {
			return false;
		}
		const searchParams = getEncodedParamsFromRequest(request, "prev_scp");
		if (searchParams === null) {
			return false;
		}
		const slot = searchParams.get("slot");
		if (slot !== expectedSlot) {
			return false;
		}
		return true;
	};

	const waitForGAMRequestForSlot = (page, slotExpected) => {
		return page.waitForRequest((request) =>
			assertOnSlotFromRequest(request, slotExpected),
		);
	};

	const gamRequestPromise = waitForGAMRequestForSlot(page, "top-above-nav");
	await gamRequestPromise;

	Log.info(`Waiting for interaction with GAM: Complete`);
};

/**
 * @summary Check if the top ad has loaded
 *
 * @param {*} page
 */
export const checkAds = async (page) => {
	await checkTopAdHasLoaded(page);
};

/**
 * @summary Check if the top ad did not load
 *
 * @param {*} page
 */
export const checkTopAdDidNotLoad = async (page) => {
	Log.info(`Checking ads do not load: Start`);

	const topAds = page.locator(ELEMENT_ID.TOP_ADVERT);
	const topAdsCount = await topAds.count();

	if (topAdsCount != 0) {
		Log.error(`Checking ads do not load: Failed`);
		throw Error("Top above nav frame present on page");
	}

	Log.info(`Checking ads do not load: Complete`);
};
/**
 * Checks that the optout ads request is made
 *
 * @param {Page} page
 */
export const checkOptOutLoads = async (page) => {
	Log.info("Checking opt out loads: start");
	await page.waitForRequest(/cdn\.optoutadvertising\.com/);
	Log.info("Checked opt out loads: complete");
};

/**
 * @summary Checks that only optout ads load on the page
 *
 * @param  page
 */
export const isUsingNonPersonalisedAds = async (page) => {
	await checkTopAdDidNotLoad(page);
};

/**
 * @summary Checks that personalised ads load on the page
 *
 * @param page
 * @return {*}  {Promise<void>}
 */
export const isUsingPersonalisedAds = async (page) => {
	await checkTopAdHasLoaded(page);
	// TODO: Check opt out is not loaded.
};

export const setGPCHeader = async (page, gpcHeader) => {
	await page.setExtraHTTPHeaders({
		"Sec-GPC": gpcHeader ? "1" : "0",
	});
};

export const checkBannerIsNotVisibleAfterSettingGPCHeader = async (page) => {
	Log.info(`Check Banner Is Not Visible After Setting GPC Header: Start`);

	await setGPCHeader(page, true);

	await reloadPage(page);

	await checkCMPIsNotVisible(page);

	await checkAds(page);

	Log.info(
		`Check Banner Is Not Visible After Setting GPC Header : Completed`,
	);
};

export const checkGPCRespected = async (page) => {
	await checkBannerIsNotVisibleAfterSettingGPCHeader(page);
};

export const checkCurrencyInBanner = async (page, expectedCurrency) => {
	Log.info(
		`Validating ${expectedCurrency} currency symbol found in banner: Start`,
	);

	try {
		const bannerText = await page
			.frameLocator(ELEMENT_ID.CMP_CONTAINER)
			.locator("body")
			.allInnerTexts();
		const fullText = bannerText.join(" ");

		if (!fullText.includes(expectedCurrency)) {
			throw new Error(
				`Expected currency symbol "${expectedCurrency}" not found in banner`,
			);
		}

		// For extra validation, check that the opposite currency is NOT present
		const oppositeCurrency =
			expectedCurrency === CURRENCY_SYMBOLS.GBP
				? CURRENCY_SYMBOLS.EUR
				: CURRENCY_SYMBOLS.GBP;
		if (fullText.includes(oppositeCurrency)) {
			Log.info(
				`Warning: Found unexpected currency symbol "${oppositeCurrency}" in banner`,
			);
		}

		Log.info(
			`Confirmed ${expectedCurrency} currency symbol is present in  banner`,
		);
	} catch (error) {
		Log.info(`Currency validation failed for banner: ${error.message}`);
		throw error;
	}

	Log.info(
		`Validating ${expectedCurrency} currency symbol found in banner: Complete`,
	);
};

/**
 * @summary Check if the privacy settings panel is open
 *
 * @param {*} config
 * @param {*} page
 * @param {*} src
 */
export const checkPrivacySettingsPanelIsOpen = async (page, src) => {
	Log.info(`Check Privacy Settings Panel is open: Start`);
	const frameLocator = `iframe[src*='${src}'][title="${ELEMENT_ID.SECOND_LAYER_TITLE}"]`;
	const secondLayer = page.locator(frameLocator);

	await secondLayer.waitFor();

	if (!(await secondLayer.isVisible())) {
		throw Error("Second Layer is not present on page");
	}

	Log.info(`Check Privacy Settings Panel is open: Complete`);
};

/**
 * @summary Check if the privacy settings panel is closed
 *
 * @param {*} config
 * @param {*} page
 * @param {*} src
 */
export const checkPrivacySettingsPanelIsClosed = async (page, src) => {
	Log.info(`Check Privacy Settings Panel is not open: Start`);
	const frameLocator = `iframe[src*='${src}'][title="${ELEMENT_ID.SECOND_LAYER_TITLE}"]`;
	const secondLayer = page.locator(frameLocator);

	try {
		// Wait for the privacy manager iframe to be detached/removed from DOM
		await secondLayer.waitFor({ state: "detached", timeout: 10000 });
	} catch (error) {
		if (error.name === "TimeoutError") {
			Log.error("Privacy Settings Panel is still present after timeout");
			throw Error("Privacy Settings Panel still present on page");
		} else {
			throw error;
		}
	}

	Log.info(`Check Privacy Settings Panel is not open: Complete`);
};
