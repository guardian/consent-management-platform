import {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	checkWillShowUi,
	shouldShow,
	showPrivacyManager,
	setErrorHandler,
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
