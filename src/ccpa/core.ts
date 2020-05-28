export type CcpaPurposeCallback = (state: boolean) => void;

export const onIabConsentNotification = (
    callback: CcpaPurposeCallback,
): void => {
    console.log('Received a callback function named', callback.name);
};
