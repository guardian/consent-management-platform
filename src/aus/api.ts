/* eslint-disable no-underscore-dangle */

import { AusData } from '../types/ccpa';

type Command = 'getCustomVendorRejects';

const api = (command: Command) =>
	new Promise((resolve, reject) => {
		if (window.__uspapi) {
			window.__uspapi(command, 1, (result, success) =>
				success
					? resolve(result)
					: /* istanbul ignore next */
					  reject(new Error('Unable to get uspapi data')),
			);
		} else {
			reject(new Error('No __uspapi found on window'));
		}
	});

export const getCustomVendorRejects = (): Promise<AusData> =>
	api('getCustomVendorRejects') as Promise<AusData>;
