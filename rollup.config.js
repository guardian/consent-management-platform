/* eslint-disable import/no-default-export -- it's what rollup likes */

import packageConfig from './src/rollup.config';
import testPageConfig from './test-page/rollup.config';

export default [packageConfig, testPageConfig];
