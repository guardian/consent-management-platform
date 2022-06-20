import type { Config } from './types';

const run = async (config: Config): Promise<void> => {
	await config.checkFunction(config);
};

export { run };
