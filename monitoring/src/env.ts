export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const configStage: string = process.env['CMP_ENV'] ?? 'prod';
export const configJurisdiction: string = process.env['CMP_REGION'] ?? 'tcfv2';
