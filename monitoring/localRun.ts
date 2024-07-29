import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import type { CustomScheduleEventContent } from './src/index';
import { handler } from './src/index';

const program = new Command();

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
		message = 'Arguments provided are missing or incorrect',
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

	const event: CustomScheduleEventContent = {
		stage: options.env,
		jurisdiction: options.jurisdiction,
	};

	console.log('To run again without interactive use the following function:', `pnpm start --env ${options.env} --jurisdiction ${options.jurisdiction}`);
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
	const answers = {
		env: await select({ message: "Which environment would you like to test?", choices: [
		  { name: 'prod', value: 'prod' },
		  { name: 'code', value: 'code' },
		  { name: 'local', value: 'local' },
		], }),
		jurisdiction: await select({ message: 'Which jurisdiction would you like to test?',choices: [
		  { name: 'tcfv2', value: 'tcfv2' },
		  { name: 'ccpa', value: 'ccpa' },
		  { name: 'aus', value: 'aus' },
		], }),
	  };


	  console.log(answers.env);
	  console.log(answers.jurisdiction);

	  await handleEvent(answers);
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
