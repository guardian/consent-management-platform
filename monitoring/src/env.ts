export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const configStage: string = process.env['STAGE'] ?? 'prod';
export const configJurisdiction: string =
	process.env['CMP_JURISDICTION'] ?? 'tcfv2';
