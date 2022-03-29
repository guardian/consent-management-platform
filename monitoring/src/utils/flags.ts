export const debugMode: boolean = process.env['DEBUG_MODE'] == 'true';
export const baseDomain: string =
	process.env['BASE_DOMAIN'] || 'https://www.theguardian.com';
