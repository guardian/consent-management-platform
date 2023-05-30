import { removeCookie, storage } from "@guardian/libs";
import { getConsentFor } from "./getConsentFor";
import { onConsentChange } from "./onConsentChange";
import { VendorWithCookieData, VendorWithLocalStorageData, storageKeys, vendorCookieData, vendorLocalStorageData } from "./vendorStorageIds";

/**
 * This function is called when the CMP is initialised. It listens for consent changes and removes cookies and localStorage data for vendors that the user has not consented to.
 */
export const initVendorDataManager = (): void => {
	onConsentChange((consent) => {
		requestIdleCallback(() => {
			storageKeys.forEach(([vendor, key, storageType]) => {
				const consentForVendor = getConsentFor(vendor, consent);

				if (!consentForVendor) {
					if (storageType === "cookie") {
						removeCookie({name: key});
					} else {
						storage.local.remove(key);
						storage.session.remove(key);
					}
				}
			});
		});
	});
};
