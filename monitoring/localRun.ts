import { program } from 'commander';
import { prompt } from 'inquirer';
import type { CustomScheduleEventContent } from './src';

type LocalRunCLIUserInput = {
	env: string;
	jurisdiction: string;
};

type LocalRunCliArguments = {
	env?: string;
	jurisdiction?: string;
};

class NoArgumentsError extends Error {
	constructor(
		message: string = 'Arguments provided are missing or incorrect',
	) {
		super(message);
		this.name = 'NoArgumentsError';
	}
}

const stages: string[] = ['local', 'code', 'prod'];
const jurisdictions: string[] = ['aus', 'ccpa', 'tcfv2'];

function isArgumentValid(args: LocalRunCliArguments): boolean {
	if (!args.env || !args.jurisdiction) {
		return false;
	}

	return (
		stages.includes(args.env) && jurisdictions.includes(args.jurisdiction)
	);
}

async function handleEvent(options: LocalRunCLIUserInput) {
	const { handler } = await import('./src');

	const event: CustomScheduleEventContent = {
		stage: options.env,
		jurisdiction: options.jurisdiction,
	};
	await handler(event);
	process.exit(0);
}

async function argumentBasedCLI() {
	program
		.option('-e, --env [environment]')
		.option('-j, --jurisdiction [environment]')
		.parse();

	const options: LocalRunCLIUserInput = program.opts();
	if (isArgumentValid(options)) {
		await handleEvent(options);
	} else {
		throw new NoArgumentsError();
	}
}

async function interactiveCLI() {
	const questions = [
		{
			type: 'list',
			name: 'env',
			message: 'Which environment would you like to test?',
			choices: stages,
		},
		{
			type: 'list',
			name: 'jurisdiction',
			message: 'Which jurisdiction would you like to test?',
			choices: jurisdictions,
		},
	];

	await prompt(questions).then(async (userInput: LocalRunCLIUserInput) => {
		await handleEvent(userInput);
	});
}

async function main() {
	try {
		await argumentBasedCLI();
	} catch (error) {
		if (error instanceof NoArgumentsError) {
			await interactiveCLI();
		} else {
			process.exit(1);
		}
	}
}

void main();
