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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line no-console
const onClose = () => console.log('closed it');

ReactDOM.render(<ConsentManagementPlatform onClose={onClose} />, document.body);
