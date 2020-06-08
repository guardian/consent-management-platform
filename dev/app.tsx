/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import { ConsentManagementPlatform } from '../src/tcf/component/ConsentManagementPlatform';
import { init, onIabConsentNotification } from '../src/index';

const initOptions = { useCcpa: false };
init(initOptions);

// import {
//     onGuConsentNotification,
//     setErrorHandler,
//     shouldShow,
//     onIabConsentNotification,
// } from '../src';

const onClose = () => {
    // do something with:
    //     onGuConsentNotification,
    //     setErrorHandler,
    //     shouldShow,
    //     onIabConsentNotification,
};

if (!initOptions.useCcpa) {
    document.body.insertAdjacentHTML('afterbegin', '<div id="app"/>');

    ReactDOM.render(
        <ConsentManagementPlatform onClose={onClose} />,
        document.getElementById('app'),
    );
}

onIabConsentNotification(() => {
    // eslint-disable-next-line no-console
    console.log('onIabConsentNotification in app.tsx');
});
