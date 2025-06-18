import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack, GuStringParameter } from '@guardian/cdk/lib/constructs/core';
import type { App } from 'aws-cdk-lib';
import {
	CfnParameter,
	Duration,
	Size,
	aws_synthetics as synthetics,
	Tags,
} from 'aws-cdk-lib';
import type { IAlarmAction } from 'aws-cdk-lib/aws-cloudwatch';
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
	Unit,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class Monitoring extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const stage = this.stage;

		const region = props.env?.region ?? 'eu-west-1';

		const prodDurationInMinutes = 2;

		new Metric({
			namespace: `Application`,
			metricName: 'CmpLoadingTime',
			period: Duration.minutes(1),
			region: region,
			unit: Unit.SECONDS,
		});

		const canaryBaseName = 'cmp-monitoring-canary';

		const bucketName = new GuStringParameter(this, 'S3BucketName', {
			description: 'The name of the S3 bucket to store artifacts',
			default: `/account/services/artifact.bucket`,
			fromSSM: true,
		}).valueAsString;

		const canaryName = `${canaryBaseName}-${region}-${stage.toLowerCase()}`;

		const canary = new synthetics.Canary(this, 'CmpMonitoringCanary', {
			canaryName: canaryName,
			artifactsBucketLocation: {
				bucket: Bucket.fromBucketName(
					this,
					'artifacts-bucket',
					bucketName,
				),
				prefix: `cmp-monitoring/${stage}/${canaryBaseName}-${region}/artifacts`,
			},
			environmentVariables: {
				stage,
				region,
			},
			test: synthetics.Test.custom({
				handler: 'index.handler',
				code: synthetics.Code.fromBucket(
					Bucket.fromBucketName(this, 'BucketName', bucketName),
					`${stage}/${canaryBaseName}-${region}/nodejs.zip`,
				),
			}),
			provisionedResourceCleanup: true,
			runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PLAYWRIGHT_1_0,
			schedule:
				stage === 'PROD'
					? synthetics.Schedule.rate(Duration.minutes(2))
					: synthetics.Schedule.rate(Duration.minutes(5)),
			timeToLive: stage === 'PROD' ? undefined : Duration.minutes(30),
			successRetentionPeriod: Duration.days(7),
			failureRetentionPeriod: Duration.days(31),
			memory: Size.mebibytes(2048),
			startAfterCreation: true,
			timeout: Duration.minutes(2),
		});

		const errorMetric = canary.metricFailed({
			period: Duration.minutes(prodDurationInMinutes),
		});

		canary.metricSuccessPercent({
			period: Duration.minutes(prodDurationInMinutes),
			statistic: 'Average',
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
			alarmDescription: `This alarm is triggered if 4 out of 5 lambda executions fail in ${region}`,
		});


		if (this.stage === 'PROD') {
			const emailSubscription = new EmailSubscription(
				'transparency.and.consent@guardian.co.uk',
			);

			const internalEmailMessaging = new Topic(
				this,
				'internalEmailRecipient',
			);
			internalEmailMessaging.addSubscription(emailSubscription);

			const alarmAction: IAlarmAction = new SnsAction(
				internalEmailMessaging,
			);

			alarm.addAlarmAction(alarmAction);
			alarm.addOkAction(alarmAction);
		}


		const buildId = new CfnParameter(this, 'BuildId', {
			type: 'String',
			description:
				'The riff-raff build id, automatically generated and provided by riff-raff',
		});
		Tags.of(canary).add('buildId', buildId.valueAsString);
	}
}
