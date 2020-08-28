/* eslint-disable no-underscore-dangle */

import { CCPAData } from './types/CCPAData';

type Command = 'getUSPData';

const api = (command: Command) =>
	new Promise((resolve, reject) => {
		if (window.__uspapi) {
			window.__uspapi(command, 1, (result, success) =>
				success
					? resolve(result)
					: reject(new Error('Unable to get uspapi data')),
			);
		} else {
			reject(new Error('No __uspapi found on window'));
		}
	});

export const getUSPData = (): Promise<CCPAData> =>
	api('getUSPData') as Promise<CCPAData>;
