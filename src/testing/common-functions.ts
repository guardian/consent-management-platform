import type { Page, Request } from 'playwright-core';

/**
 * This function console logs an info message.
 *
 * @param {string} message
 */
const log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};


/**
 * This function waits for the page to load
 * clicks the accept all button
 *
 * @param {Page} page
 * @param {string} textToPrintToConsole
 */
export const clickAcceptAllCookies = async (page: Page, textToPrintToConsole: string = "Accept All") => {

	log_info(`Clicking on "${textToPrintToConsole}" on CMP`);

	const acceptAllButton = page.frameLocator('[id*="sp_message_iframe"]').locator('button.sp_choice_type_11');
  	await acceptAllButton.click();

	log_info(`Clicked on "${textToPrintToConsole}"`);
};

/**
 * This function checks for interaction with GAM
 * Using this after advice from Commercial to check that cookies were accepted as we otherwise do not interact with GAM
 * This has to be adjusted if anything in the interaction with GAM changes or we stop using GAM
 *
 * @param {Page} page
 * @return {*}  {Promise<void>}
 */
export const checkTopAdHasLoaded = async (page: Page) => {
	log_info(`Waiting for interaction with GAM: Start`);

	const gamUrl = /https:\/\/securepubads.g.doubleclick.net\/gampad\/ads/;

	const getEncodedParamsFromRequest = (
		request: Request,
		paramName: string,
	): URLSearchParams | null => {
		const url = new URL(request.url());
		const param = url.searchParams.get(paramName);
		if (!param) return null;
		const paramDecoded = decodeURIComponent(param);
		const searchParams = new URLSearchParams(paramDecoded);
		return searchParams;
	};

	const assertOnSlotFromRequest = (request: Request, expectedSlot: string) => {
		const isURL = request.url().match(gamUrl);
		if (!isURL) return false;
		const searchParams = getEncodedParamsFromRequest(request, 'prev_scp');
		if (searchParams === null) return false;
		const slot = searchParams.get('slot');
		if (slot !== expectedSlot) return false;
		return true;
	};

	const waitForGAMRequestForSlot = (page: Page, slotExpected: string) => {
		return page.waitForRequest((request) =>
			assertOnSlotFromRequest(request, slotExpected),
		);
	};

	const gamRequestPromise = waitForGAMRequestForSlot(
		page,
		'top-above-nav',
	);
	await gamRequestPromise;

	log_info(`Waiting for interaction with GAM: Complete`);
};
