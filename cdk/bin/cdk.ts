import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { Monitoring } from '../lib/monitoring';

const app = new App();

const props: GuStackProps = {
	stack: 'cmp-monitoring',
	env: {
		region: 'eu-west-1',
	},
};

new Monitoring(app, 'CmpMonitoringStack', props);
