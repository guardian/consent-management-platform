import { log } from '@guardian/libs';
import { mark } from '../lib/mark';
import { invokeCallbacks } from '../onConsentChange';
import type { CustomVendorConsents } from '../types/tcfv2/CustomVendorConsents';
import type { TCData } from '../types/tcfv2/TCData';

type Command =
	| 'getTCData'
	| 'ping'
	| 'addEventListener'
	| 'removeEventListener'
	| 'getCustomVendorConsents'; // Sourcepoint addition https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support/__tcfapi-getcustomvendorconsents-api

const api = (command: Command): Promise<TCData> =>
	new Promise((resolve, reject) => {
		if (window.__tcfapi) {
			window.__tcfapi(command, 2, (result, success) =>
				success
					? resolve(result)
					: /* istanbul ignore next */
					  reject(new Error(`Unable to get ${command} data`)),
			);
		} else {
			reject(new Error('No __tcfapi found on window'));
		}
	});

export const getTCData = (): Promise<TCData> => api('getTCData');

export const getCustomVendorConsents = (): Promise<CustomVendorConsents> =>
	api('getCustomVendorConsents') as unknown as Promise<CustomVendorConsents>;

export const tcfApiEventListener = (): void => {
	// https://documentation.sourcepoint.com/api/gdpr-tcf-v2-api/the-__tcfapi-gettcdata-api-overview/using-__tcfapi-addeventlistener-and-removeeventlistener-commands
	if (window.__tcfapi) {
		window.__tcfapi('addEventListener', 2, (result, success) => {
			const { eventStatus } = result;
			log('cmp', 'Tcf api event:', eventStatus);

			if (!success) {
				log('cmp', 'Tcf api addEventListener failed:');
			}

			switch (eventStatus) {
				case 'tcloaded':
					mark('cmp-tcfv2-got-consent');
					invokeCallbacks();
					break;
				case 'useractioncomplete':
					mark('cmp-tcfv2-user-action-complete');
					invokeCallbacks();
					break;
			}
		});
	} else {
		console.warn('No __tcfapi found on window');
	}
};
