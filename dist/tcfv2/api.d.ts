import type { CustomVendorConsents } from '../types/tcfv2/CustomVendorConsents';
import type { TCData } from '../types/tcfv2/TCData';
export declare const getTCData: () => Promise<TCData>;
export declare const getCustomVendorConsents: () => Promise<CustomVendorConsents>;
