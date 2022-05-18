import { envAwsRegion, envJurisdiction, envStage } from './env';
import { checkPage as checkAusPage } from './check-page/aus';
import { checkPage as checkCCPAPage } from './check-page/ccpa';
import { checkPage as checkTcfV2Page } from './check-page/tcfv2';
import type { Config } from './types';

type JurisdictionOpt = string | undefined;
type AwsRegionOpt = string | undefined;

const decideJurisdition = (
	jurisdiction: JurisdictionOpt,
	awsRegion: AwsRegionOpt,
): string => {
	jurisdiction;
	awsRegion;
	if (jurisdiction) {
		return jurisdiction;
	}
	if (awsRegion === 'eu-west-1') {
		return 'tcfv2';
	}
	if (awsRegion === 'us-west-1') {
		return 'ccpa';
	}
	if (awsRegion === 'ap-southeast-2') {
		return 'aus';
	}
	return 'tcfv2'; // default value
};

const ConfigTcfv2Prod: Config = {
	stage: 'prod',
	jurisdiction: 'tcfv2',
	frontUrl: 'https://www.theguardian.com',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	checkFunction: checkTcfV2Page,
};

const ConfigTcfv2Code: Config = {
	stage: 'code',
	jurisdiction: 'tcfv2',
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://cdn.privacy-mgmt.com',
	checkFunction: checkTcfV2Page,
};

const ConfigCCPAProd: Config = {
	stage: 'prod',
	jurisdiction: 'ccpa',
	frontUrl: 'https://www.theguardian.com/us',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: checkCCPAPage,
};

const ConfigCCPACode: Config = {
	stage: 'code',
	jurisdiction: 'ccpa',
	frontUrl: 'https://m.code.dev-theguardian.com/us',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://cdn.privacy-mgmt.com',
	checkFunction: checkCCPAPage,
};

const ConfigAusProd: Config = {
	stage: 'prod',
	jurisdiction: 'aus',
	frontUrl: 'https://www.theguardian.com/au',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: checkAusPage,
};

const ConfigAusCode: Config = {
	stage: 'code',
	jurisdiction: 'aus',
	frontUrl: 'https://m.code.dev-theguardian.com/au',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: checkAusPage,
};

const availableEnvConfig = [
	ConfigTcfv2Prod,
	ConfigTcfv2Code,
	ConfigCCPAProd,
	ConfigCCPACode,
	ConfigAusProd,
	ConfigAusCode,
];

export const envConfig: Config = (() => {
	const jurisdiction = decideJurisdition(envJurisdiction, envAwsRegion);
	const foundConfig = availableEnvConfig.find(
		(value) =>
			value.stage == envStage.toLowerCase() &&
			value.jurisdiction == jurisdiction,
	);

	if (foundConfig === undefined) {
		const j = envJurisdiction ?? 'missing';
		const r = envAwsRegion ?? 'missing';
		throw `No config found for (env)stage: ${envStage}, (env)jurisdiction: ${j}, (env)aws-region: ${r}`;
	}

	return foundConfig;
})();
