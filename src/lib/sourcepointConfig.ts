import { isGuardianDomain } from './domain';

export const ACCOUNT_ID = 1257;
export const PRIVACY_MANAGER_CCPA = '5eba7ef78c167c47ca8b433d';
export const PRIVACY_MANAGER_TCFV2 = 106842;
export const PRIVACY_MANAGER_AUSTRALIA = '5f859e174ed5055e72ce26a6';

export const ENDPOINT = isGuardianDomain()
	? 'https://sourcepoint.theguardian.com'
	: 'https://cdn.privacy-mgmt.com';
export type EndPoint = typeof ENDPOINT;
