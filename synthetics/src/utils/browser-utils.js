import { Log } from "./log.js";

/**
 * @summary Create a new playwright browser
 * Using chromium as the default browser
 *
 * @param {*} debugMode
 * @return {*}
 */
export const makeNewBrowser = async (browserType, debugMode) => {
	const browser = await browserType.launch({
		headless: !debugMode,
	});
	return browser;
};

/**
 * @summary Creates a new browser context.
 * @param browser - The browser instance.
 * @returns A promise that resolves to the newly created browser context.
 */
export const makeNewContext = async (browser) => {
	return await browser.newContext();
};

/**
 * @summary Create a new playwright page
 *
 * @param {*} browser
 * @return {*}
 */
export const makeNewPage = async (context) => {
	const page = await context.newPage();
	return page;
};

/**
 * This function will clear the cookies for a chromium client
 *
 * @param {CDPSession} client
 * @return {*}  {Promise<void>}
 */
export const clearCookies = async (page) => {
	Log.info(`Cleared Cookies: Start`);

	await page.context().clearCookies();
	Log.info(`Cleared Cookies: Complete`);
};

/**
 * This function clears the local storage of a page
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const clearLocalStorage = async (page) => {
	await page.evaluate(() => window.localStorage.clear());
	await page.evaluate(() => window.sessionStorage.clear());
	Log.info(`Cleared LocalStorage`);
};

/**
 * @summary This function will drop the cookies for a non-advertising banner
 *
 * @param {*} page
 */
export const dropCookiesForNonAdvertisingBanner = async (page) => {
	const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await page.context().addCookies([
		{
			name: "gu_allow_reject_all",
			value: sevenDaysLater.toUTCString(),
			domain: ".theguardian.com",
			path: "/",
		},
		{
			name: "gu_hide_support_messaging",
			value: sevenDaysLater.toUTCString(),
			domain: ".theguardian.com",
			path: "/",
		},
		{
			name: "gu_user_benefits_expiry",
			value: sevenDaysLater.toUTCString(),
			domain: ".theguardian.com",
			path: "/",
		},
	]);
};

/**
 * @summary This function will drop the cookies for a signed in user
 *
 * @param {*} page
 */
export const dropCookiesForSignedInUser = async (page) => {
	await page.context().addCookies([
		{
			name: "GU_U",
			value: "WyIzMjc5Nzk0IiwiIiwiSmFrZTkiLCIiLDE2NjA4MzM3NTEyMjcsMCwxMjEyNjgzMTQ3MDAwLHRydWVd.MC0CFQCIbpFtd0J5IqK946U1vagzLgCBkwIUUN3UOkNfNN8jwNE3scKfrcvoRSg",
			domain: ".theguardian.com",
			path: "/",
		},
		{
			name: "SC_GU_U",
			value: "WyIzMjc5Nzk0IiwiIiwiSmFrZTkiLCIiLDE2NjA4MzM3NTEyMjcsMCwxMjEyNjgzMTQ3MDAwLHRydWVd.MC0CFQCIbpFtd0J5IqK946U1vagzLgCBkwIUUN3UOkNfNN8jwNE3scKfrcvoRSg",
			domain: ".theguardian.com",
			path: "/",
		},
	]);
};

/**
 * @summary Load the page
 *
 * @param {*} page
 * @param {*} url
 */
export const loadPage = async (page, url) => {
	Log.info(`Loading page: Start : ${url}`);

	const response = await page.goto(url, {
		waitUntil: "domcontentloaded",
		timeout: 30000,
	});

	// If the response status code is not a 2xx success code
	if (response != null) {
		if (response.status() < 200 || response.status() > 299) {
			Log.error(`Loading URL: Error: Status ${response.status()}`);
			throw "Failed to load page!";
		}
	}

	Log.info(`Loading page: Complete`);
};

/**
 * @summary Reload the page
 *
 * @param {Page} page
 */
export const reloadPage = async (page) => {
	Log.info(`Reloading page: Start`);
	const reloadResponse = await page.reload({
		waitUntil: "domcontentloaded",
		timeout: 30000,
	});
	if (!reloadResponse) {
		Log.error(`Reloading page: Failed`);
		throw "Failed to refresh page!";
	}
	Log.info(`Reloading page: Complete`);
};
