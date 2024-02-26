import { Page } from "playwright-core";

export type getCMPVersionRunning = (page: Page) => void;
export type clickAcceptAllCookies = (page: Page, message: string) => void
export type log_error = (message: string) => void;
export type log_info = (message: string) => void;

