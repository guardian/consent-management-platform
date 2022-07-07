export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const envStage: string = process.env['STAGE']
	? process.env['STAGE']
	: 'prod';
export const envJurisdiction: string | undefined =
	process.env['CMP_JURISDICTION'];
export const envAwsRegion: string | undefined = process.env['AWS_REGION'];
