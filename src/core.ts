import { init as initStore, getConsentState } from './store';
import {
    GuPurposeCallback,
    GuResponsivePurposeEventId,
    GuPurpose,
    GuPurposeRegister,
    IabPurposeCallback,
    IabPurposeState,
} from './types';
import { GU_PURPOSE_LIST } from './config';

let initialised = false;

const guPurposeRegister: GuPurposeRegister = buildGuRegister();
const iabPurposeRegister: IabPurposeCallback[] = [];

const init = (): void => {
    if (!initialised) {
        initStore(onStateChange);
        initialised = true;
    }
};

const onStateChange = (
    guState: GuPurposeState,
    iabState: IabPurposeState,
): void => {
    // Iterate over guPurposeRegister callbacks
    Object.keys(guPurposeRegister).forEach((key: string): void => {
        const guCallbacks =
            guPurposeRegister[key as GuResponsivePurposeEventId];
        guCallbacks.forEach((callback: GuPurposeCallback): void =>
            callback(guState[key]),
        );
    });
    // Iterate over iabPurposeRegister callbacks
    iabPurposeRegister.forEach((callback: IabPurposeCallback): void => {
        callback(iabState);
    });
};

const buildGuRegister = (): GuPurposeRegister => {
    const { purposes } = GU_PURPOSE_LIST;

    const purposeRegister = purposes.reduce(
        (register, purpose: GuPurpose): {} => {
            if (purpose.alwaysEnabled) {
                return register;
            }

            return {
                ...register,
                [purpose.eventId]: [],
            };
        },
        {},
    );

    return purposeRegister as GuPurposeRegister;
};

const onIabConsentNotification = (callback: IabPurposeCallback): void => {
    init();

    const { iabState } = getConsentState();
    callback(iabState);

    iabPurposeRegister.push(callback);
};

const onGuConsentNotification = (
    purposeName: GuResponsivePurposeEventId,
    callback: GuPurposeCallback,
): void => {
    init();

    const { guState } = getConsentState();
    const purposeState = guState[purposeName];
    callback(purposeState);

    guPurposeRegister[purposeName].push(callback);
};

export { init, onGuConsentNotification, onIabConsentNotification };
// Exposed for testing
// export const _ = {
//     updateStateOnSave,
//     resetCmp: (): void => {
//         cmpIsReady = false;
//         // reset guPurposeRegister
//         Object.keys(guPurposeRegister).forEach((key: string): void => {
//             const guPurpose =
//                 guPurposeRegister[key as GuResponsivePurposeEventId];

//             guPurpose.state = null;
//             guPurpose.callbacks = [];
//         });
//         // reset iabPurposeRegister
//         iabPurposeRegister.state = {
//             1: null,
//             2: null,
//             3: null,
//             4: null,
//             5: null,
//         };
//         iabPurposeRegister.callbacks = [];
//     },
// };
