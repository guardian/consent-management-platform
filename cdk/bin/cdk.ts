import 'source-map-support/register';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { App } from 'aws-cdk-lib';
import { Monitoring } from '../lib/monitoring';

const app = new App();

type AwsRegion = 'eu-west-1' | 'us-west-1' | 'ap-southeast-2' | 'ca-central-1';

function stackProps(awsRegion: AwsRegion, stage: string): GuStackProps {
	const stackName = 'frontend';

	return {
		stack: stackName,
		stage: stage,
		env: {
			region: awsRegion,
		},
	};
}

new Monitoring(
	app,
	'CmpMonitoringStackEUCode',
	stackProps('eu-west-1', 'CODE'),
);
new Monitoring(
	app,
	'CmpMonitoringStackEUProd',
	stackProps('eu-west-1', 'PROD'),
);
new Monitoring(
	app,
	'CmpMonitoringStackUSCode',
	stackProps('us-west-1', 'CODE'),
);
new Monitoring(
	app,
	'CmpMonitoringStackUSProd',
	stackProps('us-west-1', 'PROD'),
);
new Monitoring(
	app,
	'CmpMonitoringStackAUCode',
	stackProps('ap-southeast-2', 'CODE'),
);
new Monitoring(
	app,
	'CmpMonitoringStackAUProd',
	stackProps('ap-southeast-2', 'PROD'),
);
new Monitoring(
	app,
	'CmpMonitoringStackCACode',
	stackProps('ca-central-1', 'CODE'),
);
new Monitoring(
	app,
	'CmpMonitoringStackCAProd',
	stackProps('ca-central-1', 'PROD'),
);
