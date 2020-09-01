import {
	checkWillShowUi,
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	setErrorHandler,
	shouldShow,
	showPrivacyManager,
} from '@guardian/old-cmp';
import { ConsentManagementPlatform } from '@guardian/old-cmp/dist/ConsentManagementPlatform';

export const oldCmp = {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	checkWillShowUi,
	shouldShow,
	showPrivacyManager,
	setErrorHandler,
	ConsentManagementPlatform,
};
