import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class Monitoring extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const stage = this.stage;

		const region = props.env?.region ?? 'eu-west-1';

		const lambdaBaseName = 'cmp-monitoring';

		const monitoringLambdaFunction = new GuLambdaFunction(
			this,
			lambdaBaseName,
			{
				app: `${lambdaBaseName}-lambda-${region}`,
				functionName: `${lambdaBaseName}-${stage}`,
				fileName: `${lambdaBaseName}-lambda-${region}.zip`,
				handler: 'index.handler',
				runtime: Runtime.NODEJS_14_X,
				timeout: Duration.seconds(300),
				memorySize: 2048,
			},
		);

		const lambdaEventTarget = new LambdaFunction(monitoringLambdaFunction, {
			event: RuleTargetInput.fromObject({
				stage: 'PROD', // Both scheduled cmp-monitoring-CODE and cmp-monitoring-PROD are monitoring prod versions
				region: region,
			}),
		});

		const monitoringDuration: Duration =
			stage === 'PROD' ? Duration.minutes(2) : Duration.days(1); // Every day for CODE; Every 2 minutes for PROD.

		new Rule(this, 'cmp monitoring schedule', {
			schedule: Schedule.rate(monitoringDuration),
			targets: [lambdaEventTarget],
		});
	}
}
