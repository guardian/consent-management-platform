import 'source-map-support/register';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { App } from 'aws-cdk-lib';
import { Monitoring } from '../lib/monitoring';

const app = new App();

const regionNames = [
	'eu-west-1',
	'us-west-1',
	'ap-southeast-2',
	'ca-central-1',
] as const;
type AwsRegion = typeof regionNames[number];

const deployableEnvs = ['CODE', 'PROD'] as const;
type DeployableEnvironments = typeof deployableEnvs[number];

function stackProps(
	awsRegion: AwsRegion,
	stage: DeployableEnvironments,
): GuStackProps {
	const stackName = 'frontend';

	return {
		stack: stackName,
		stage: stage,
		env: {
			region: awsRegion,
		},
	};
}

for (const region of regionNames) {
	for (const stage of deployableEnvs) {
		const zoneCode = region.substring(0, 2).toUpperCase();
		const stageName = stage.charAt(0) + stage.slice(1).toLowerCase();

		new Monitoring(
			app,
			'CmpMonitoringStack' + zoneCode + stageName,
			stackProps(region, stage),
		);
	}
}
