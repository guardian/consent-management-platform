export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const envStage: string = process.env['STAGE']
	? process.env['STAGE']
	: 'prod';
export const envJurisdiction: string | undefined =
	process.env['CMP_JURISDICTION'];
export const envAwsRegion: string | undefined = process.env['AWS_REGION'];

// This is the DCR endpoint
export const localBaseURL: string = process.env['LOCAL_BASE_URL']
	? process.env['LOCAL_BASE_URL']
	: 'http://localhost:9000';

export const envPlatform: string = process.env['STAGE']
	? process.env['STAGE']
	: 'PROD';
