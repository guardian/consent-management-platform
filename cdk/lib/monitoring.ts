// import { Alarm } from '@aws-cdk/aws-cloudwatch';

import { Rule, RuleTargetInput, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Runtime } from '@aws-cdk/aws-lambda';
import type { App } from '@aws-cdk/core';
import { Duration } from '@aws-cdk/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';

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

		// Both scheduled cmp-monitoring-CODE and cmp-monitoring-PROD are monitoring prod versions
		const lambdaEventTarget = new LambdaFunction(monitoringLambdaFunction, {
			event: RuleTargetInput.fromObject({
				stage: 'PROD',
				region: region,
			}),
		});

		new Rule(this, 'cmp monitoring schedule', {
			schedule: Schedule.rate(Duration.minutes(5)), // Every 5 minutes for test and every 2 minutes.
			targets: [lambdaEventTarget],
		});

		// const cloudWatchAlarm = new Alarm(this, )
	}
}
