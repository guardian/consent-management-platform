import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import {
	Alarm,
	ComparisonOperator,
	Metric,
	Unit,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class Monitoring extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const stage = this.stage;

		const region = props.env?.region ?? 'eu-west-1';

		const lambdaBaseName = 'cmp-monitoring';

		const policyStatement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['cloudwatch:PutMetricData'],
			resources: ['*'],
		});

		const monitoringLambdaFunction = new GuLambdaFunction(
			this,
			lambdaBaseName,
			{
				app: `${lambdaBaseName}-lambda-${region}`,
				functionName: `${lambdaBaseName}-${stage}`,
				fileName: `${lambdaBaseName}-lambda-${region}.zip`,
				handler: 'index.handler',
				runtime: Runtime.NODEJS_18_X,
				timeout: Duration.seconds(300),
				memorySize: 3072,
				initialPolicy: [policyStatement],
			},
		);

		new Metric({
			namespace: `Application`,
			metricName: 'CmpLoadingTime',
			period: Duration.minutes(1),
			region: region,
			unit: Unit.SECONDS,
		});

		// Defining metric for lambda errors each minute
		const errorMetric = monitoringLambdaFunction.metricErrors({
			period: Duration.minutes(1),
		});

		// Defining metric for lambda errors each minute
		monitoringLambdaFunction.metricInvocations({
			period: Duration.minutes(1),
		});

		const lambdaEventTarget = new LambdaFunction(monitoringLambdaFunction, {
			event: RuleTargetInput.fromObject({
				stage: 'PROD', // Both scheduled cmp-monitoring-CODE and cmp-monitoring-PROD are monitoring prod versions
				region: region,
			}),
		});

		const monitoringDuration: Duration =
			stage === 'PROD' ? Duration.minutes(2) : Duration.minutes(2); // Every day for CODE; Every 2 minutes for PROD.

		new Rule(this, 'cmp monitoring schedule', {
			schedule: Schedule.rate(monitoringDuration),
			targets: [lambdaEventTarget],
		});

		// Error Alarm
		new Alarm(this, 'cmp-monitoring-alarms', {
			comparisonOperator:
				ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 1,
			metric: errorMetric,
			alarmDescription:
				'Alarm if the SUM of Errors is greater than or equal to the threshold (1) for 1 evaluation period',
		});
	}
}
