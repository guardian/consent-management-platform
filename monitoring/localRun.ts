import { prompt } from 'inquirer';
import type { CustomScheduleEventContent } from './src';

type UserInput = {
	stage: string;
	jurisdiction: string[];
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
			name: 'jurisdiction',
			message:
				'Which jurisdiction would you like to test? (Use the up and down keys to move ,space bar to select the jurisdiction)',
			choices: ['aus', 'ccpa', 'tcfv2'],
		},
	]).then((userInput: UserInput) => {
		userInput.jurisdiction.forEach((jurisdiction) => {
			const event: CustomScheduleEventContent = {
				stage: userInput.stage,
				jurisdiction: jurisdiction,
			};
			handler(event).catch(console.error);
		});
	});
}

void main();
