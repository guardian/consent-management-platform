/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import { removeCookie, storage } from '@guardian/libs';
import { getConsentFor } from './getConsentFor';
import { onConsentChange } from './onConsentChange';
import type { ConsentState } from './types';
import type { VendorWithData } from './vendorStorageIds';
import { vendorStorageIds } from './vendorStorageIds';

const removeData = (consent: ConsentState) =>
	(<VendorWithData[]>Object.keys(vendorStorageIds)).forEach((vendor) => {
		const consentForVendor = getConsentFor(vendor, consent);
		const vendorData = vendorStorageIds[vendor];
		if (!consentForVendor) {
			if ('cookies' in vendorData) {
				vendorData.cookies.forEach((name) => {
					removeCookie({ name });
				});
			}
			if ('localStorage' in vendorData) {
				vendorData.localStorage.forEach((name) => {
					storage.local.remove(name);
				});
			}
			if ('sessionStorage' in vendorData) {
				vendorData.sessionStorage.forEach((name) => {
					storage.session.remove(name);
				});
			}
		}
	});

/**
 * This function is called when the CMP is initialised. It listens for consent changes and removes cookies and localStorage data for vendors that the user has not consented to.
 */
export const initVendorDataManager = (): void => {
	onConsentChange((consent) => {
		if ('requestIdleCallback' in window) {
			requestIdleCallback(
				() => {
					removeData(consent);
				},
				{
					timeout: 2000,
				},
			);
		} else {
			removeData(consent);
		}
	});
};
