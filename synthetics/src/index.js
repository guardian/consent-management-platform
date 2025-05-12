// eslint-disable-next-line import/no-unresolved -- This library is not in the public npm registry
import { synthetics } from "@amzn/synthetics-playwright";
import { main } from "./main";

export const handler = async () => {
	await main(synthetics);
};
