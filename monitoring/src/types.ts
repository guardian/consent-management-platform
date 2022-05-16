import type { Browser, Viewport } from 'puppeteer-core';

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
	checkFunction: (config: Config, browser: Browser) => Promise<void>;
};
