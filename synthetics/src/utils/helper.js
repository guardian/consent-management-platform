const regionToJurisdictionMap = {
	"eu-west-1": "tcfv2",
	"eu-west-2": "tcfv2",
	"us-west-1": "ccpa",
	"ap-southeast-2": "aus",
	"ca-central-1": "tcfv2",
};

const getJurisdiction = (region) => {
	if (!regionToJurisdictionMap[region]) {
		throw new Error(`Invalid region: ${region}`);
	}

	return regionToJurisdictionMap[region];
};

module.exports = {
	regionToJurisdictionMap,
	getJurisdiction,
};
