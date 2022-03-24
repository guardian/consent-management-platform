import type { CMP } from './types';
export declare const cmp: CMP;
export declare const onConsentChange: (fn: import("./types").Callback) => void;
export declare const getConsentFor: (vendor: "a9" | "acast" | "braze" | "comscore" | "facebook-mobile" | "fb" | "firebase" | "google-analytics" | "google-mobile-ads" | "google-sign-in" | "google-tag-manager" | "googletag" | "ias" | "inizio" | "ipsos" | "lotame" | "nielsen" | "ophan" | "permutive" | "prebid" | "redplanet" | "remarketing" | "sentry" | "teads" | "twitter" | "youtube-player", consent: import("./types").ConsentState) => boolean;
