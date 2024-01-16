import type { CCPAData, GPPData } from '../types/ccpa';

type UspApiCommand = 'getUSPData';
type GppCommand = 'ping';

const uspApi = (command: UspApiCommand) =>
	new Promise((resolve, reject) => {
		if (window.__uspapi) {
			window.__uspapi(command, 1, (result, success) =>
				success
					? resolve(result)
					: /* istanbul ignore next */
					  reject(new Error(`Unable to get ${command} data`)),
			);
		} else {
			reject(new Error('No __uspapi found on window'));
		}
	});

const gppApi = (command: GppCommand) =>
	new Promise((resolve, reject) => {
		if (window.__gpp) {
			window.__gpp(command, (result, success) =>
				success
					? resolve(result)
					: /* istanbul ignore next */
					  reject(new Error(`Unable to get ${command} data`)),
			);
		} else {
			reject(new Error('No __gpp found on window'));
		}
	});

export const getGPPData = (): Promise<GPPData> =>
	gppApi('ping') as Promise<GPPData>;

export const getUSPData = (): Promise<CCPAData> =>
	uspApi('getUSPData') as Promise<CCPAData>;
