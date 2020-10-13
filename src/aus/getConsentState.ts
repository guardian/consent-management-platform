/* eslint-disable no-underscore-dangle */

import { getCustomVendorRejects } from '../ccpa/api';
import { CustomVendorRejects } from '../types/ccpa';

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<CustomVendorRejects> = async () => {
	const customVendorRejects = await getCustomVendorRejects();

	return customVendorRejects;
};
