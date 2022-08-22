import type { Viewport } from 'puppeteer-core';

declare global {
	interface Window {
		__uspapi: (
			command: string,
			version: number,
			callback: (uspData: UspData) => void,
		) => undefined;
	}
}

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

export type JurisdictionOpt = string | undefined;

export type AwsRegionOpt = string | undefined;

export enum JURISDICTIONS {
	TCFV2 = 'tcfv2',
	CCPA = 'ccpa',
	AUS = 'aus',
}

export enum STAGES {
	PROD = 'prod',
	CODE = 'code',
	LOCAL = 'local',
}

export const AWS_REGIONS = {
	EU_WEST_1: 'eu-west-1',
	US_WEST_1: 'us-west-1',
	CA_CENTRAL_1: 'ca-central-1',
	AP_SOUTHEAST_2: 'ap-southeast-2',
};

export type Stage = STAGES.PROD | STAGES.CODE | STAGES.LOCAL;

export type Jurisdiction =
	| JURISDICTIONS.AUS
	| JURISDICTIONS.CCPA
	| JURISDICTIONS.TCFV2;

export type Config = {
	stage: Stage;
	jurisdiction: Jurisdiction;
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

export type UspData = {
	version: number;
	uspString: string;
	newUser: boolean;
	dateCreated: string;
	gpcEnabled: boolean;
};

export type CheckStatus = SuccessfulCheck | FailedCheck;
