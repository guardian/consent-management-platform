import { configEnv, configRegion } from './env';
import { checkPage as checkTcfV2Page } from './regions/tcfv2';
import type { Config } from './types';

const ProdTcfv2Config: Config = {
	configKey: 'prod',
	regionKey: 'tcfv2',
	frontUrl: 'https://www.theguardian.com',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	checkFunction: checkTcfV2Page,
};

const CodeTcfv2Config: Config = {
	configKey: 'code',
	regionKey: 'tcfv2',
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://cdn.privacy-mgmt.com',
	checkFunction: checkTcfV2Page,
};

const availableEnvConfig = [ProdTcfv2Config, CodeTcfv2Config];

export const envConfig: Config = (() => {
	const foundConfig = availableEnvConfig.find(
		(value) =>
			value.configKey == configEnv && value.regionKey == configRegion,
	);

	if (foundConfig === undefined) {
		throw `No config found for ${configEnv}, ${configRegion}`;
	}

	return foundConfig;
})();