const { writeFileSync } = require('fs');
const { join } = require('path');
const fastGlob = require('fast-glob');
const { compiler } = require('flowgen');

fastGlob.sync([`${join('dist')}/**/*.d.ts`]).map((file) =>
	writeFileSync(
		file.replace(/.d.ts$/, '.js.flow'),
		compiler.compileDefinitionFile(file, {
			inexact: false,
			// interfaceRecords: true,
		}),
	),
);
