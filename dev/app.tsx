/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import { ConsentManagementPlatform } from '../src/tcf/component/ConsentManagementPlatform';
import { init } from '../src/index';

const useCcpa = false;
init(useCcpa);

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

if (!useCcpa) {
    document.body.insertAdjacentHTML('afterbegin', '<div id="app"/>');

    ReactDOM.render(
        <ConsentManagementPlatform onClose={onClose} />,
        document.getElementById('app'),
    );
}
