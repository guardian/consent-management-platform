/* eslint-disable no-underscore-dangle */

import { CCPAData } from './types/CCPAData';

type Command = 'getUSPData';

const api = (command: Command) =>
	new Promise((resolve, reject) => {
		if (window.__uspapi) {
			window.__uspapi(command, 1, (result, success) => {
				if (success) {
					resolve(result);
				} else {
					reject();
				}
			});
		}
	});

export const getUSPData = () => api('getUSPData') as Promise<CCPAData>;
