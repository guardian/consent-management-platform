/**
 * THIS FILE IS NO LONGER USED. IT IS KEPT FOR REFERENCE ONLY AND WILL BE
 * DELETED SOON.
 *
 * THE EQUIVALENT FILE IS NOW LOCATED AT:
 * https://github.com/guardian/csnx/tree/main/libs/%40guardian/libs/src/consent-management-platform
 */

import type { CountryCode } from '@guardian/libs';
import type { Framework } from './types';

export const getFramework = (countryCode: CountryCode): Framework => {
	let framework: Framework;
	switch (countryCode) {
		case 'US':
			framework = 'ccpa';
			break;

		case 'AU':
			framework = 'aus';
			break;

		case 'GB':
		default:
			framework = 'tcfv2';
			break;
	}

	return framework;
};
