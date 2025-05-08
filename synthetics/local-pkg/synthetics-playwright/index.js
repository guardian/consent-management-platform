// const playwright = require("playwright-core");

// const browserState = {
// 	browser: null,
// };

// const synthetics = {
// 	async launch() {
// 		browserState.browser = await playwright.chromium.launch();
// 		return browserState.browser;
// 	},
// 	async newPage(browser) {
// 		return await browser.newPage();
// 	},
// 	async close() {
// 		if (browserState.browser) {
// 			await browserState.browser.close();
// 			browserState.browser = null;
// 		}
// 	},
// };

// module.exports = { synthetics };
