export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const configEnv: string = process.env['TEST_ENV'] ?? 'prod';
