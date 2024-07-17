import type { InvokeCommandOutput } from '@aws-sdk/client-lambda';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { select, checkbox } from '@inquirer/prompts';
import type { CustomScheduleEventContent } from './src/index';


type RemoteRunCLIUserInput = {
	stage: string;
	regions: string[];
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

	const answers = {
	stage: await select({ message: "Which environment would you like to test?", choices: [
		{ name: 'prod', value: 'prod' },
		{ name: 'code', value: 'code' },
	], }),
	regions: await checkbox({ message: 'Which regions would you like to test?',
		choices: [
			{ name: 'us-west-1', value: 'us-west-1' },
			{ name: 'eu-west-1', value: 'eu-west-1' },
			{ name: 'ap-southeast-2', value: 'ap-southeast-2' },
			{ name: 'ca-central-1', value: 'ca-central-1' },
		],
		required: true,
	})};

	console.log(answers.stage);
	console.log(answers.regions);

	async function handleEvent(userInput: RemoteRunCLIUserInput) {
		const invokeSettledResults = await Promise.allSettled(
			userInput.regions.map((region) =>
				invokeInRegion(
					region,
					'cmp-monitoring-CODE',
					userInput.stage,
				),
			),
		);

		invokeSettledResults.map((result) => {
			if (result.status == 'fulfilled') {
				processResult(result.value);
			} else {
				console.log('------------------------------------------');
				console.log('Failed to get response: ', result.reason);
				console.log('------------------------------------------');
			}
		});

		process.exit(0);
	}

	handleEvent(answers);
}

void main();
