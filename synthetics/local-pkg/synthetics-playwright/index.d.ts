import type { Browser, Page } from "playwright-core";

declare module "@amzn/synthetics-playwright" {
	export const synthetics: {
		launch: () => Promise<Browser>;
		newPage: (browser: Browser) => Promise<Page>;
		close: () => Promise<void>;
	};
}
