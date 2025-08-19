import { BannerInteractions, ELEMENT_ID } from "./constants.js";
import { Log } from "./log.js";

/**
 * @summary Click on the "Save and Close" button in the second layer of the CMP
 *
 * @param {*} config
 * @param {*} page
 * @param {*} buttonId
 */
export const clickSaveAndCloseSecondLayer = async (
	config,
	page,
	frameSrc,
	buttonId,
) => {
	Log.info(`Clicking on save and close button: Start`);
	const saveAndExitButton = page
		.frameLocator('[src*="' + frameSrc + '"]')
		.locator(buttonId);

	await saveAndExitButton.click();

	Log.info(`Clicking on save and exit button: Complete`);
};

/**
 * @summary Click on the "Cancel" button in the second layer of the CMP
 *
 * @param {*} page
 * @param {*} domainUrl
 * @param {*} messageId
 * @param {*} cancelButtonId
 */
export const clickCancelSecondLayer = async (
	page,
	domainUrl,
	messageId,
	cancelButtonId,
) => {
	Log.info(`Clicking on cancel button: Start`);
	const frameLocator = `iframe[src*='${domainUrl}'][src*='${messageId}']`;

	const cancelButton = page
		.frameLocator(frameLocator)
		.locator(cancelButtonId);

	await cancelButton.click();

	Log.info(`Clicking on cancel button: Complete`);
};

/**
 * @summary Click on the "Cancel" button in the second layer of the CMP
 *
 * @param {*} page
 * @param {*} domainUrl
 * @param {*} messageId
 * @param {*} currentToggleSetting - "on" or "off"
 */
export const clickToggleSecondLayer = async (
	page,
	domainUrl,
	messageId,
	requiredToggleSetting,
) => {
	Log.info(`Clicking on toggle button: Start`);
	const frameLocator = `iframe[src*='${domainUrl}'][src*='${messageId}']`;
	const toggle = page
		.frameLocator(frameLocator)
		.locator(`button[role="switch"] span.${requiredToggleSetting}`);
	await toggle.waitFor({ state: "visible" });
	await toggle.click();
	Log.info(`Clicking on toggle button: Complete`);
};

/**
 * @summary Open the privacy settings panel
 *
 * @param {*} page
 * @param {*} manageCookiesId
 */
export const openPrivacySettingsPanel = async (page, manageCookiesId) => {
	Log.info(`Loading privacy settings panel: Start`);
	// Wait for the CMP iframe to appear
	await page.waitForSelector(ELEMENT_ID.CMP_CONTAINER, { timeout: 10000 });

	let manageButton = page
		.frameLocator(ELEMENT_ID.CMP_CONTAINER)
		.locator(manageCookiesId);

	await manageButton.click();

	Log.info(`Loading privacy settings panel: Complete`);
};

/**
 * @summary Click on the button in the CMP banner
 *
 * @param {Page} page
 * @param {string} textToPrintToConsole
 * @param {string} bannerInteraction
 */
export const clickBannerButton = async (
	page,
	textToPrintToConsole,
	bannerInteraction,
) => {
	Log.info(`Clicking on "${textToPrintToConsole}" on CMP`);

	let buttonId;
	switch (bannerInteraction) {
		case BannerInteractions.ACCEPT_ALL:
			buttonId = ELEMENT_ID.TCFV2_FIRST_LAYER_ACCEPT_ALL;
			break;
		case BannerInteractions.REJECT_AND_SUBSCRIBE:
			buttonId = ELEMENT_ID.TCFV2_CORP_FIRST_LAYER_REJECT_SUBSCRIBE;
			break;
		case BannerInteractions.REJECT_ALL:
			buttonId = ELEMENT_ID.TCFV2_FIRST_LAYER_REJECT_ALL;
			break;
		case BannerInteractions.DO_NOT_SELL:
			buttonId = ELEMENT_ID.CCPA_DO_NOT_SELL_BUTTON;
			break;
		case BannerInteractions.MANAGE_COOKIES:
			buttonId = ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES;
			break;
		default:
			throw new Error("Invalid banner interaction");
	}

	const button = page
		.frameLocator(ELEMENT_ID.CMP_CONTAINER)
		.locator(buttonId);
	await button.click();

	Log.info(`Clicked on "${textToPrintToConsole}"`);
};
