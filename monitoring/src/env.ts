export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const configEnv: string = process.env['CMP_ENV'] ?? 'prod';
export const configRegion: string = process.env['CMP_REGION'] ?? 'tcfv2';
