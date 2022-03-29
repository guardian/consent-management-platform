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

		const lambdaBaseName = 'cmp-monitoring';
		new GuLambdaFunction(this, lambdaBaseName, {
			app: lambdaBaseName,
			functionName: `${lambdaBaseName}-${stage}`,
			fileName: `${lambdaBaseName}.zip`,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_14_X,
			timeout: Duration.seconds(300),
			memorySize: 1024,
		});
	}
}
