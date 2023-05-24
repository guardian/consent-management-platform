import type { VendorName } from './vendors';

/**
 * This is a list of vendors that store data in localStorage or cookies along with the keys they use (that we know of).
 */

export const vendorLocalStorageData = {
	a9: ['apstagUserAgentClientHints', 'apstagCxMEnabled'],
	inizio: ['__bm_s', '__bm_m'],
	criteo: [
		'criteo_fast_bid_expires',
		'cto_bundle',
		'criteo_fast_bid',
		'criteo_pt_cdb_mngr_metrics',
	],
	ipsos: [
		'DotmetricsSiteData',
		'DotMetricsTimeOnPage',
		'DotMetricsUserId',
		'DotMetricsDeviceGuidId',
	],
	permutive: [
		'permutive-data-queries',
		'_pubcid',
		'permutive-pvc',
		'permutive-data-enrichers',
		'permutive-session',
		'permutive-data-misc',
		'permutive-unprocessed-pba',
		'permutive-app',
		'permutive-data-models',
		'permutive-id',
		'permutive-consent',
		'permutive-events-cache',
		'permutive-data-queries',
		'permutive-events-for-page',
	],
	prebid: ['_psegs', '_pubcid_exp'],
} satisfies Partial<Record<VendorName, string[]>>;

export type VendorWithLocalStorageData = keyof typeof vendorLocalStorageData;

export const vendorCookieData = {
	criteo: ['cto_bundle'],
	ipsos: ['DM_SitId1073', 'DM_SitId1073SecId5802'],
	googletag: ['__gpi', '__gads'],
	'google-analytics': ['_gid', '_ga'],
} satisfies Partial<Record<VendorName, string[]>>;

export type VendorWithCookieData = keyof typeof vendorCookieData;
