import { BannerInteractions, ELEMENT_ID } from "./constants";
import { Log } from "./log";

/**
 * @summary Click on the "Save and Close" button in the second layer of the CMP
 *
 * @param {*} config
 * @param {*} page
 */
export const clickSaveAndCloseSecondLayer = async (config, page) => {
	Log.info(`Clicking on save and close button: Start`);
	const saveAndExitButton = page
		.frameLocator('[src*="' + config.iframeDomainUrlSecondLayer + '"]')
		.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_SAVE_AND_EXIT);

	await saveAndExitButton.click();

	Log.info(`Clicking on save and exit button: Complete`);
};

/**
 * @summary Open the privacy settings panel
 *
 * @param {*} config
 * @param {*} page
 */
export const openPrivacySettingsPanel = async (page) => {
	Log.info(`Loading privacy settings panel: Start`);
	let manageButton = page
		.frameLocator(ELEMENT_ID.CMP_CONTAINER)
		.locator(ELEMENT_ID.TCFV2_FIRST_LAYER_MANAGE_COOKIES);

	await manageButton.click();

	Log.info(`Loading privacy settings panel: Complete`);
};

/**
 * @summary Check if the privacy settings panel is open
 *
 * @param {*} config
 * @param {*} page
 */
export const checkPrivacySettingsPanelIsOpen = async (config, page) => {
	Log.info(`Waiting for Privacy Settings Panel: Start`);
	const secondLayer = page
		.frameLocator('[src*="' + config.iframeDomainUrlSecondLayer + '"]')
		.locator(ELEMENT_ID.TCFV2_SECOND_LAYER_HEADLINE);

	await secondLayer.waitFor();

	if (!(await secondLayer.isVisible())) {
		throw Error("Second Layer is not present on page");
	}

	Log.info(`Waiting for Privacy Settings Panel: Complete`);
};

/**
 * @summary Click on the button in the CMP banner
 *
 * @param {Page} page
 * @param {string} textToPrintToConsole
 * @param {string} buttonId
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
