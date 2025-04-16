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
	TreatMissingData,
	Unit
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, RuntimeManagementMode } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class Monitoring extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const stage = this.stage;

		const region = props.env?.region ?? 'eu-west-1';

		const lambdaBaseName = 'cmp-monitoring';

		// const runTimeId = "0cdcfbdefbc5e7d3343f73c2e2dd3cba17d61dea0686b404502a0c9ce83931b9";

		const prodDurationInMinutes = 2;

		const policyStatement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['cloudwatch:PutMetricData'],
			resources: ['*'],
		});

		// const runTimeManagementArn = `arn:aws:lambda:${region}::runtime:${runTimeId}`

		const monitoringLambdaFunction = new GuLambdaFunction(
			this,
			lambdaBaseName,
			{
				app: `${lambdaBaseName}-lambda-${region}`,
				functionName: `${lambdaBaseName}-${stage}`,
				fileName: `${lambdaBaseName}-lambda.zip`,
				handler: 'index.handler',
				runtime: Runtime.NODEJS_18_X,
				// runtimeManagementMode: RuntimeManagementMode.manual(runTimeManagementArn),
				runtimeManagementMode: RuntimeManagementMode.FUNCTION_UPDATE,
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
			period: Duration.minutes(prodDurationInMinutes),
		});

		// Defining metric for lambda errors each minute
		monitoringLambdaFunction.metricInvocations({
			period: Duration.minutes(prodDurationInMinutes),
		});

		const lambdaEventTarget = new LambdaFunction(monitoringLambdaFunction, {
			event: RuleTargetInput.fromObject({
				stage: 'PROD', // Both scheduled cmp-monitoring-CODE and cmp-monitoring-PROD are monitoring prod versions
				region: region,
			}),
		});


		const monitoringDuration: Duration =
			stage === 'PROD' ? Duration.minutes(prodDurationInMinutes) : Duration.days(1); // Every day for CODE; Every 2 minutes for PROD.

		new Rule(this, 'cmp monitoring schedule', {
			schedule: Schedule.rate(monitoringDuration),
			targets: [lambdaEventTarget],
		});


		// Error Alarm
		const alarm = new Alarm(this, 'cmp-monitoring-alarms', {
			comparisonOperator:
				ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			threshold: 1,
			evaluationPeriods: 5, // This value is the number of periods to watch. Here, we're evaluating 5 executions of the lambda. The lambda is triggered every 2minutes so it's check over a 10 minute timeframe.
			actionsEnabled: true,
			datapointsToAlarm: 4, // This value is the number of failed data-points/executions that will trigger the alarm. so 4 out of 5
			treatMissingData: TreatMissingData.NOT_BREACHING,
			metric: errorMetric,
			alarmName: `CMP Monitoring - ${stage} - ${region}`,
			alarmDescription:
				`This alarm is triggered if 4 out of 5 lambda executions fail in ${region}`,
		});

		if(this.stage === "PROD"){
			const emailSubscription = new EmailSubscription(
				"transparency.and.consent@guardian.co.uk"
			);

			const internalEmailMessaging = new Topic(this, "internalEmailRecipient");
			internalEmailMessaging.addSubscription(emailSubscription);

			const alarmAction: IAlarmAction = new SnsAction(internalEmailMessaging);

			alarm.addAlarmAction(alarmAction)
			alarm.addOkAction(alarmAction)
		}

	}
}
