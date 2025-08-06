import { JURISDICTIONS } from "./constants.js";

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

export const constructFrontsUrl = (url, jurisdiction) => {
	let framework;

	switch (jurisdiction) {
		case JURISDICTIONS.AUS:
			framework = "au";
			break;
		case JURISDICTIONS.USNAT:
			framework = "us";
			break;
		case JURISDICTIONS.TCFV2:
			framework = "europe";
			break;
		case JURISDICTIONS.TCFV2CORP:
			framework = "uk";
			break;
	}

	return `${url}/${framework}`;
};

export const appendQueryParams = (url, config, includeAdTest = true) => {
	const queryParams = getQueryParams(config, includeAdTest);
	if (queryParams) {
		return `${url}${queryParams}`;
	}
	return url;
};
