import packageConfig from './src/rollup.config';
import testPageConfig from './test-page/rollup.config';

// eslint-disable-next-line import/no-default-export -- This is what rollup expects
export default [packageConfig, testPageConfig];
