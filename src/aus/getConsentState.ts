/* eslint-disable no-underscore-dangle */

import { CustomVendorRejects } from '../types/aus';
import { getCustomVendorRejects } from './api';

// get the current constent state using the official IAB method
export const getConsentState: () => Promise<CustomVendorRejects> = async () => {
	const customVendorRejects = await getCustomVendorRejects();

	return customVendorRejects;
};
