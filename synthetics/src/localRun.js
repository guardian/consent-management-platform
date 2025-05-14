import { select } from "@inquirer/prompts";
import { Command } from "commander";
import { chromium } from "playwright-core";
import { main } from "./main.js";
import { ConfigHelper } from "./utils/config/config-helper.js";
import { JURISDICTIONS, STAGES } from "./utils/constants.js";
import { Log } from "./utils/log.js";


const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
/**
 * @summary This function checks if the arguments provided are valid.
 *
 * @param {*} options
 * @return {*}
 */
const isArgumentValid = (options) => {
	const { stage, jurisdiction } = options;

	if (!stage || !jurisdiction) {
		return false;
	}

	return (
		Object.values(STAGES).includes(stage.toLowerCase()) &&
		Object.values(JURISDICTIONS).includes(jurisdiction.toLowerCase())
	);
};

class NoArgumentsError extends Error {
	constructor(message = "Arguments provided are missing or incorrect") {
		super(message);
		this.name = "NoArgumentsError";
	}
}

/**
 * @summary This function handles the command line arguments and runs the main function.
 *
 */
const argumentBasedCLI = async () => {
	const program = new Command();

	program
		.option("-s, --stage <stage>", "Specify the stage")
		.option("-j, --jurisdiction <jurisdiction>", "Specify the jurisdiction")
		.parse(process.argv);

	const options = program.opts();

	if (isArgumentValid(options)) {
		const { stage, jurisdiction } = options;
		const region = ConfigHelper.getRegion(jurisdiction);
		await main(chromium, region.toLowerCase(), stage.toLowerCase());
	} else {
		throw new NoArgumentsError();
	}
};

/**
 * @summary This function handles the interactive command line interface.
 *
 */
const interactiveCLI = async () => {
	const answers = {
		stage: await select({
			message: "Which environment/stage would you like to test?",
			choices: Object.values(STAGES).map((val) => {
				return { name: val, value: val };
			}),
		}),
		jurisdiction: await select({
			message: "Which jurisdiction would you like to test?",
			choices: Object.values(JURISDICTIONS).map((val) => {
				return { name: val, value: val };
			}),
		}),
	};

	const { stage, jurisdiction } = answers;
	Log.line();
	console.log(
		"To run again without interactive use the following function:",
		`${YELLOW} pnpm start --stage ${stage} --jurisdiction ${jurisdiction} ${RESET}`,
	);
	const region = ConfigHelper.getRegion(jurisdiction);

	await main(chromium, region.toLowerCase(), stage.toLowerCase());
};

const handler = async () => {
	try {
		await argumentBasedCLI();
	} catch (error) {
		if (error instanceof NoArgumentsError) {
			console.log("No arguments provided. Starting interactive CLI...");
			await interactiveCLI();
		} else {
			console.error("Error in handler:", error);
			process.exit(1);
		}
	}
};

await handler();
