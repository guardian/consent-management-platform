import Chromium from 'chrome-aws-lambda';
import type { Browser } from 'puppeteer-core';
import type { Config, CustomPuppeteerOptions } from './types';

const initialiseOptions = async (
	isDebugMode: boolean,
): Promise<CustomPuppeteerOptions> => {
	return {
		headless: !isDebugMode,
		args: isDebugMode ? ['--window-size=1920,1080'] : Chromium.args,
		defaultViewport: Chromium.defaultViewport,
		executablePath: await Chromium.executablePath,
		ignoreHTTPSErrors: true,
		devtools: isDebugMode,
		timeout: 0,
	};
};

const launchBrowser = async (ops: CustomPuppeteerOptions): Promise<Browser> => {
	return await Chromium.puppeteer.launch(ops);
};

const run = async (config: Config, isDebugMode: boolean): Promise<Browser> => {
	const ops = await initialiseOptions(isDebugMode);
	const browser = await launchBrowser(ops);
	await config.checkFunction(config);
	return browser;
};

export { run };
