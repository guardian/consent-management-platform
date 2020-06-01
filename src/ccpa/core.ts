export type CcpaPurposeCallback = (state: boolean) => void;

export const onIabConsentNotification = (
    callback: CcpaPurposeCallback,
): void => {
    // Leaving this console.log as a placeholder. Will be removed in next PR.
    // eslint-disable-next-line no-console
    console.log('Received a callback function named', callback.name);
};
