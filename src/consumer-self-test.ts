import type { Page } from 'playwright-core';

const ELEMENT_ID = {
	TCFV2_FIRST_LAYER_ACCEPT_ALL:
		'div.message-component.message-row > button.sp_choice_type_11',
	CMP_CONTAINER: '[id*="sp_message_iframe"]',
};

/**
 * This function console logs an info message.
 *
 * @param {string} message
 */
export const log_info = (message: string): void => {
	console.log(`(cmp monitoring) info: ${message}`);
};

/**
 * This function console logs an error message.
 *
 * @param {string} message
 */
export const log_error = (message: string): void => {
	console.error(`(cmp monitoring): error: ${message}`);
};

/**
 * This function waits for the page to load
 * clicks the accept all button
 *
 * @param {Config} config
 * @param {Page} page
 * @param {string} textToPrintToConsole
 */
export const clickAcceptAllCookies = async (page: Page, textToPrintToConsole: string) => {

	log_info(`Clicking on "${textToPrintToConsole}" on CMP`);

	const acceptAllButton = page.frameLocator(ELEMENT_ID.CMP_CONTAINER).locator(ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL);
  	await acceptAllButton.click();

	log_info(`Clicked on "${textToPrintToConsole}"`);
};
