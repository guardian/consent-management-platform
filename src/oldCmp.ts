import {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	checkWillShowUi,
	shouldShow,
	setErrorHandler,
} from '@guardian/old-cmp';
import { ConsentManagementPlatform } from '@guardian/old-cmp/dist/ConsentManagementPlatform';

export const oldCmp = {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	checkWillShowUi,
	shouldShow,
	setErrorHandler,
	ConsentManagementPlatform,
};
