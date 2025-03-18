import 'source-map-support/register';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { App } from 'aws-cdk-lib';
import { Monitoring } from '../lib/monitoring';

const app = new App();

const regionNames = [
	'eu-west-1',
	'eu-west-2',
	'us-west-1',
	'ap-southeast-2',
	'ca-central-1',
] as const;
type AwsRegion = (typeof regionNames)[number];

const deployableEnvs = ['CODE', 'PROD'] as const;
type DeployableEnvironments = (typeof deployableEnvs)[number];

function toPascalCase(input: string): string {
    return input
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function stackProps(
	awsRegion: AwsRegion,
	stage: DeployableEnvironments,
): GuStackProps {
	const stackName = 'cmp-monitoring';

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
		const regionCode = toPascalCase(region);
		const stageName = stage.charAt(0) + stage.slice(1).toLowerCase();

		new Monitoring(
			app,
			'CmpMonitoringStack' + regionCode + stageName,
			stackProps(region, stage),
		);
	}
}
