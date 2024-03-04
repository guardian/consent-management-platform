import type { CCPAData, GPPData } from '../types/ccpa';

type UspApiCommand = 'getUSPData';
type GppApiCommand = 'ping';

const uspapi = (command: UspApiCommand) =>
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

const gppapi = (command: GppApiCommand) =>
	new Promise((resolve, reject) => {
		if (window.__gpp) {
			window.__gpp(command, (result, success) =>
				success
					? resolve(result)
					: /* istanbul ignore next */
						reject(new Error(`Unable to get ${command} data`)),
			);
		} else {
			reject(new Error('No _gpp found on window'));
		}
	});

export const getUSPData = (): Promise<CCPAData> =>
	uspapi('getUSPData') as Promise<CCPAData>;

export const getGPPData = (): Promise<GPPData> =>
	gppapi('ping') as Promise<GPPData>;
