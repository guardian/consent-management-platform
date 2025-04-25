import type { Browser, Page } from "playwright-core";

//synthetics-playwright.d.ts
declare module '@amzn/synthetics-playwright' {
	export const synthetics: {
	  launch: () => Promise<Browser>;
	  newPage: (browser: any) => Promise<Page>;
	  close: () => Promise<void>;
	};
  }
