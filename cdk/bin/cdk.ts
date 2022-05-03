import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { Monitoring } from '../lib/monitoring';

const app = new App();

type AwsRegion = 'eu-west-1' | 'us-west-1' | 'ap-southeast-2';

function stackProps(awsRegion: AwsRegion): GuStackProps {
	const stackName = 'playground';

	return {
		stack: stackName,
		env: {
			region: awsRegion,
		},
	};
}

new Monitoring(app, 'CmpMonitoringStackEU', stackProps('eu-west-1'));
new Monitoring(app, 'CmpMonitoringStackUS', stackProps('us-west-1'));
new Monitoring(app, 'CmpMonitoringStackAU', stackProps('ap-southeast-2'));
