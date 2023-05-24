import { removeCookie, storage } from "@guardian/libs";
import { getConsentFor } from "./getConsentFor";
import { onConsentChange } from "./onConsentChange";
import { VendorWithCookieData, VendorWithLocalStorageData, vendorCookieData, vendorLocalStorageData } from "./vendorStorageIds";

/**
 * This function is called when the CMP is initialised. It listens for consent changes and removes cookies and localStorage data for vendors that the user has not consented to.
 */
export const initVendorDataManager = (): void => {
	onConsentChange((consent) => {
		(<VendorWithCookieData[]>Object.keys(vendorCookieData)).forEach((vendor) => {
			const consentForVendor = getConsentFor(vendor, consent);
			if (!consentForVendor) {
				vendorCookieData[vendor].forEach((name) => {
					removeCookie({name});
				});

			}
		});

		(<VendorWithLocalStorageData[]>Object.keys(vendorLocalStorageData)).forEach((vendor) => {
			const consentForVendor = getConsentFor(vendor, consent);
			if (!consentForVendor) {
				vendorLocalStorageData[vendor].forEach((name) => {
					storage.local.remove(name);
					storage.session.remove(name);
				});

			}
		});
	});
};
