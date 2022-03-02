export const VendorIDs = {
	// keep the list in README.md up to date with these values
	a9: ['5f369a02b8e05c308701f829'],
	acast: ['5f203dcb1f0dea790562e20f'],
	braze: ['5ed8c49c4b8ce4571c7ad801'],
	comscore: ['5efefe25b8e05c06542b2a77'],
	fb: ['5e7e1298b8e05c54a85c52d2'],
	'google-analytics': ['5e542b3a4cd8884eb41b5a72'],
	'google-mobile-ads': ['5f1aada6b8e05c306c0597d7'],
	'google-tag-manager': ['5e952f6107d9d20c88e7c975'],
	googletag: ['5f1aada6b8e05c306c0597d7'],
	ias: ['5e7ced57b8e05c485246ccf3'],
	inizio: ['5e37fc3e56a5e6615502f9c9'],
	ipsos: ['5f745ab96f3aae0163740409'],
	lotame: ['5ed6aeb1b8e05c241a63c71f'],
	nielsen: ['5ef5c3a5b8e05c69980eaa5b'],
	ophan: ['5f203dbeeaaaa8768fd3226a'],
	permutive: ['5eff0d77969bfa03746427eb'],
	prebid: ['5f92a62aa22863685f4daa4c'],
	redplanet: ['5f199c302425a33f3f090f51'],
	remarketing: ['5ed0eb688a76503f1016578f'],
	sentry: ['5f0f39014effda6e8bbd2006'],
	teads: ['5eab3d5ab8e05c2bbe33f399'],
	twitter: ['5e71760b69966540e4554f01'],
	'youtube-player': ['5e7ac3fae30e7d1bc1ebf5e8'],
};

export type VendorName = keyof typeof VendorIDs;