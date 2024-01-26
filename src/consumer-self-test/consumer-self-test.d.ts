import type { Browser, BrowserContext, Page } from 'playwright-core';
export declare class ConsumerSelfTest {
    log_info: (message: string) => void;
    log_error: (message: string) => void;
    elfClearCookies: (page: Page) => Promise<void>;
    selfClearLocalStorage: (page: Page) => Promise<void>;
    selfMakeNewBrowser: (debugMode: boolean) => Promise<Browser>;
    selfMakeNewPage: (context: BrowserContext) => Promise<Page>;
    selfClickAcceptAllCookies: (page: Page, cmpContainer: string, firstLayerAcceptAll: string) => Promise<void>;
    selfOpenPrivacySettingsPanel: (iframeDomainSecondLayer: string, page: Page, cmpContainer: string, firstLayerManageCookies: string, secondLayerHeadLine: string) => Promise<void>;
    selfCheckPrivacySettingsPanelIsOpen: (iframeDomainSecondLayer: String, page: Page, secondLayerHeadline: string) => Promise<void>;
    selfClickSaveAndCloseSecondLayer: (iframeDomainSecondLayer: string, page: Page, secondLayerSaveAndExit: string) => Promise<void>;
    selfClickRejectAllSecondLayer: (iframeDomainSecondLayer: string, page: Page, secondLayerRejectAll: string) => Promise<void>;
    selfCheckTopAdHasLoaded: (page: Page) => Promise<void>;
    selfCheckTopAdDidNotLoad: (page: Page, topAdvert: string) => Promise<void>;
    recordVersionOfCMP: (page: Page) => Promise<void>;
    selfCheckCMPIsOnPage: (page: Page, cmpContainer: string) => Promise<void>;
    selfCheckCMPIsNotVisible: (page: Page, cmpContainer: string) => Promise<void>;
    selfLoadPage: (page: Page, url: string) => Promise<void>;
    selfReloadPage: (page: Page) => Promise<void>;
}
