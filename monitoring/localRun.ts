import { prompt } from 'inquirer';
import type { CustomScheduleEventContent } from './src';

type LocalRunCLIUserInput = {
	stage: string;
	jurisdictions: string[];
};

async function main() {
	const { handler } = await import('./src');

	await prompt([
		{
			type: 'list',
			name: 'stage',
			message: 'Which environment would you like to test?',
			choices: ['code', 'prod'],
		},
		{
			type: 'checkbox',
			name: 'jurisdictions',
			message: 'Which jurisdiction would you like to test?',
			choices: ['aus', 'ccpa', 'tcfv2'],
			validate(input: string[]) {
				// console.log('OI', input);
				if (input.length === 0) {
					return 'Please select a jurisdiction';
				}
				return true;
			},
		},
	]).then(async (userInput: LocalRunCLIUserInput) => {
		for (const jurisdiction of userInput.jurisdictions) {
			const event: CustomScheduleEventContent = {
				stage: userInput.stage,
				jurisdiction: jurisdiction,
			};
			await handler(event);
		}
	});
}

void main();
