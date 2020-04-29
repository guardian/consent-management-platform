/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import { ConsentManagementPlatform } from '../src/component/ConsentManagementPlatform';

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

ReactDOM.render(<ConsentManagementPlatform onClose={onClose} />, document.body);
