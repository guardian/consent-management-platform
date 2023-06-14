// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

import { version } from './package.json';

export const globals = { __PACKAGE_VERSION__: version };
export const clearMocks = true;
export const testPathIgnorePatterns = ['cypress', 'cdk', 'monitoring'];
export const testEnvironment = 'jsdom';
