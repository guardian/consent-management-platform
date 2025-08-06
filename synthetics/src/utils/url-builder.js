const getQueryParams = (config) => {
	if (config.sourcepointEnvironment === "stage") {
		return `?adtest=fixed-puppies&_sp_env=${config.sourcepointEnvironment}`;
	}

	return "?adtest=fixed-puppies";
};

export const appendQueryParams = (url, config) => {
	const queryParams = getQueryParams(config);
	if (queryParams) {
		return `${url}${queryParams}`;
	}
	return url;
};
