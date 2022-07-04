import type { InvokeCommandOutput } from '@aws-sdk/client-lambda';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { prompt } from 'inquirer';
import type { CustomScheduleEventContent } from './src';

type RemoteRunCLIUserInput = {
	stage: string;
};

const decode = (str: string) => Buffer.from(str, 'base64').toString();

async function invokeInRegion(
	region: string,
	functionName: string,
	stage: string,
): Promise<InvokeCommandOutput> {
	const payload: CustomScheduleEventContent = {
		region: region,
		stage: stage,
	};
	const command = new InvokeCommand({
		FunctionName: functionName,
		LogType: 'Tail',
		Payload: Buffer.from(JSON.stringify(payload)),
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

	await prompt([
		{
			type: 'list',
			name: 'stage',
			message: 'Which environment would you like to test?',
			choices: ['prod', 'code'],
		},
	]).then(async (userInput: RemoteRunCLIUserInput) => {
		const invokeSettledResults = await Promise.allSettled(
			regionsToCheck.map((region) =>
				invokeInRegion(region, 'cmp-monitoring-CODE', userInput.stage),
			),
		);

		invokeSettledResults.map((result) => {
			if (result.status == 'fulfilled') {
				processResult(result.value);
			} else {
				console.log('Failed to get response: ', result.reason);
			}
		});

		process.exit(0);
	});
}

void main();
