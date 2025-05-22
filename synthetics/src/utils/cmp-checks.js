import { reloadPage } from "./browser-utils.js";
import { ELEMENT_ID } from "./constants.js";
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

	const cmpl = page.locator(ELEMENT_ID.CMP_CONTAINER);

	if (await cmpl.isVisible()) {
		throw Error("CMP still present on page");
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
