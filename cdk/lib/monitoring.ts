import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import type {
	IAlarmAction} from 'aws-cdk-lib/aws-cloudwatch';
import {
	Alarm,
	ComparisonOperator,
	Metric,
	Unit
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

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
				memorySize: 2048,
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
			stage === 'PROD' ? Duration.minutes(2) : Duration.days(1); // Every day for CODE; Every 2 minutes for PROD.

		new Rule(this, 'cmp monitoring schedule', {
			schedule: Schedule.rate(monitoringDuration),
			targets: [lambdaEventTarget],
		});

		// Error Alarm
		const alarm = new Alarm(this, 'cmp-monitoring-alarms', {
			comparisonOperator:
				ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 10,
			actionsEnabled: true,
			datapointsToAlarm: 5,
			metric: errorMetric,
			alarmDescription:
				'Alarm if the SUM of Errors is greater than or equal to the threshold (4) for 5 evaluation period',
		});

		// const alarm = new Alarm(this, `Alarm`, {
		// 	actionsEnabled: true,
		// 	alarmDescription: 'Either a Front or an Article CMP has failed',
		// 	alarmName: `Commercial canary`,
		// 	comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
		// 	datapointsToAlarm: 5,
		// 	evaluationPeriods: 5,
		// 	metric: new Metric({
		// 		namespace: 'CloudWatchSynthetics',
		// 		metricName: 'SuccessPercent',
		// 		statistic: 'avg',
		// 		period: Duration.minutes(1),
		// 		dimensionsMap: {
		// 			CanaryName: canaryName,
		// 		},
		// 	}),
		// 	threshold: 80,
		// 	treatMissingData: TreatMissingData.BREACHING,
		// });

		// alarm.addAlarmAction(new SnsAction(topic));
		// alarm.addOkAction(new SnsAction(topic));


		const emailSubscription = new EmailSubscription(
			"akinsola.lawanson@guardian.co.uk"
		);

		const internalEmailMessaging = new Topic(this, "internalEmailRecipient");
		internalEmailMessaging.addSubscription(emailSubscription);

		const alarmAction: IAlarmAction = new SnsAction(internalEmailMessaging);

		alarm.addAlarmAction(alarmAction)
		alarm.addOkAction(alarmAction)
	}
}
