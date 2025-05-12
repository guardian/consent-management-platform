export const synthetics = {
	async launch() {
		return {}
	},
	async newPage(browser) {
		return {
			browser,
		}
	},
	async close() {
		return {}
	},
};
