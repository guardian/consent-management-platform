import { configEnv } from './flags';

export interface Config {
	configKey: string;
	baseDomain: string;
	iframeDomain: string;
}

const ProdConfig: Config = {
	configKey: 'prod',
	baseDomain: 'https://www.theguardian.com',
	iframeDomain: 'https://sourcepoint.theguardian.com',
};

const CodeConfig: Config = {
	configKey: 'code',
	baseDomain: 'https://m.code.dev-theguardian.com',
	iframeDomain: 'https://cdn.privacy-mgmt.com',
};

const availableEnvConfig = [ProdConfig, CodeConfig];

export const envConfig: Config =
	availableEnvConfig.find((value) => value.configKey == configEnv) ??
	ProdConfig;
