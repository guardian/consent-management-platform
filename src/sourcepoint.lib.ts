// https://documentation.sourcepoint.com/web-implementation/sourcepoint-gdpr-and-tcf-v2-support-beta/gdpr-and-tcf-v2-setup-and-configuration#1-two-step-process-to-implement-the-gdpr-and-tcf-v2-code-snippet

export const lib = document.createElement('script');
lib.id = 'sourcepoint-lib';
lib.src = 'https://gdpr-tcfv2.sp-prod.net/wrapperMessagingWithoutDetection.js';
