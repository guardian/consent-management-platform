import { JURISDICTIONS, STAGES } from "./constants.js";

const getQueryParams = (config, includeAdTest) => {
	const queryParams = new URLSearchParams();

	if (includeAdTest) {
		queryParams.append("adtest", "fixed-puppies");
	}
	if (config.sourcepointEnvironment === "stage") {
		queryParams.append("_sp_env", config.sourcepointEnvironment);
	}

	return queryParams.toString() ? `?${queryParams.toString()}` : "";
};

export const constructFrontsUrl = (url, jurisdiction, config) => {
	if (config.stage === STAGES.LOCAL) {
		url = appendQueryParams(url, config, false);
		url = appendRegionToUrl(url, jurisdiction);
	} else {
		url = appendRegionToUrl(url, jurisdiction);
		url = appendQueryParams(url, config, false);
	}

	return url;
};

const appendRegionToUrl = (url, jurisdiction) => {
	let region;

	switch (jurisdiction) {
		case JURISDICTIONS.AUS:
			region = "au";
			break;
		case JURISDICTIONS.USNAT:
			region = "us";
			break;
		case JURISDICTIONS.TCFV2:
			region = "europe";
			break;
		case JURISDICTIONS.TCFV2CORP:
			region = "uk";
			break;
	}

	return `${url}/${region}`;
};

export const appendQueryParams = (url, config, includeAdTest = true) => {
	const queryParams = getQueryParams(config, includeAdTest);
	if (queryParams) {
		return `${url}${queryParams}`;
	}
	return url;
};
