import { prompt } from 'inquirer';
import type { CustomScheduleEventContent } from './src';
import type { CheckStatus } from './src/types';

type CLIUserInput = {
	stage: string;
	jurisdictions: string[];
};
const handleUserInput = async (
	userInput: CLIUserInput,
	jurisdiction: string,
	callback: (event: CustomScheduleEventContent) => Promise<CheckStatus>,
) => {
	const event: CustomScheduleEventContent = {
		stage: userInput.stage,
		jurisdiction: jurisdiction,
	};
	await callback(event);
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
			message:
				'Which jurisdiction would you like to test? (Use the up and down keys to move ,space bar to select the jurisdiction)',
			choices: ['aus', 'ccpa', 'tcfv2'],
		},
	]).then(async (userInput: CLIUserInput) => {
		for (const jurisdiction of userInput.jurisdictions) {
			// await handleUserInput(userInput, jurisdiction, handler);
			const event: CustomScheduleEventContent = {
				stage: userInput.stage,
				jurisdiction: jurisdiction,
			};
			await handler(event);
		}
	});
}

void main();
