import type { Viewport } from 'puppeteer-core';

export type CustomPuppeteerOptions = {
	headless: boolean;
	args: string[];
	defaultViewport: Required<Viewport>;
	executablePath: string;
	ignoreHTTPSErrors: boolean;
	devtools?: boolean;
	timeout?: number;
	waitUntil?: string;
	dumpio?: boolean;
};

export type Config = {
	stage: 'prod' | 'code';
	jurisdiction: 'tcfv2' | 'ccpa' | 'aus';
	frontUrl: string;
	articleUrl: string;
	iframeDomain: string;
	debugMode: boolean;
	checkFunction: (config: Config) => Promise<void>;
};

export type SuccessfulCheck = {
	key: 'success';
};

export type FailedCheck = {
	key: 'failure';
	errorMessage: string;
};

export type CheckStatus = SuccessfulCheck | FailedCheck;
