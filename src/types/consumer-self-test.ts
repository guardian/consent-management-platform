import { Page } from "playwright-core";

export type GetCMPVersionRunning = (page: Page) => void;
export type ClickAcceptAllCookies = (page: Page, message: string) => void
export type Log_error = (message: string) => void;
export type Log_info = (message: string) => void;

