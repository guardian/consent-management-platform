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
	configKey: string;
	baseDomain: string;
	iframeDomain: string;
};
