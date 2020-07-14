import {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	shouldShow,
	setErrorHandler,
} from '@guardian/old-cmp';
import { ConsentManagementPlatform } from '@guardian/old-cmp/dist/ConsentManagementPlatform';

export const oldCmp = {
	init,
	onGuConsentNotification,
	onIabConsentNotification,
	shouldShow,
	setErrorHandler,
	ConsentManagementPlatform,
};
