import type { InvokeCommandOutput } from '@aws-sdk/client-lambda';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const decode = (str: string) => Buffer.from(str, 'base64').toString();

async function invokeInRegion(
	region: string,
	functionName: string,
): Promise<InvokeCommandOutput> {
	const command = new InvokeCommand({
		FunctionName: functionName,
		LogType: 'Tail',
	});

	const client = new LambdaClient({ region: region });
	return await client.send(command);
}

function processResult(result: InvokeCommandOutput) {
	const logResult = result.LogResult;

	if (logResult) {
		console.log(decode(logResult));
	}
}

async function main() {
	const regionsToCheck = [
		'us-west-1',
		'eu-west-1',
		'ap-southeast-2',
		'ca-central-1',
	];

	const invokeSettledResults = await Promise.allSettled(
		regionsToCheck.map((region) =>
			invokeInRegion(region, 'cmp-monitoring-CODE'),
		),
	);

	invokeSettledResults.map((result) => {
		if (result.status == 'fulfilled') {
			processResult(result.value);
		} else {
			console.log('Failed to get response: ', result.reason);
		}
	});
}

void main();
