import type { CustomVendorRejects } from '../types/aus';
import { sourcepointLibraryLoaded } from './sourcepoint';

type Command = 'getCustomVendorRejects';

const api = (command: Command) =>
	new Promise(
		(resolve, reject) =>
			void sourcepointLibraryLoaded.then(() => {
				if (window.__uspapi) {
					window.__uspapi(command, 1, (result, success) =>
						success
							? resolve(result)
							: /* istanbul ignore next */
							  reject(
									new Error(`Unable to get ${command} data`),
							  ),
					);
				} else {
					reject(new Error('No __uspapi found on window'));
				}
			}),
	);

export const getCustomVendorRejects = (): Promise<CustomVendorRejects> =>
	api('getCustomVendorRejects') as Promise<CustomVendorRejects>;
