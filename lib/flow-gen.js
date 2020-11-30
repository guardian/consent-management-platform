const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const fastGlob = require('fast-glob');
const { compiler } = require('flowgen');

const writeFile = promisify(fs.writeFile);

await Promise.all(
	(
		await fastGlob([`${join('dist')}/**/*.d.ts`])
	).map((file: string): Promise<void> =>
		writeFile(
			join(file.replace(/.d.ts$/, '.js.flow')),
			compiler.compileDefinitionFile(file),
		),
	),
);
