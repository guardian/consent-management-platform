/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import { ConsentManagementPlatform } from '../src/tcf/component/ConsentManagementPlatform';
import {
	init,
	onIabConsentNotification,
	showPrivacyManager,
	checkWillShowUi,
} from '../src/index';

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
} else {
	checkWillShowUi().then((result: boolean) =>
		// eslint-disable-next-line no-console
		console.log('checkWillShowUi returned', result),
	);
}

onIabConsentNotification(() => {
	// eslint-disable-next-line no-console
	console.log('onIabConsentNotification in app.tsx');
});

const settingsLink = document.createElement('a');
settingsLink.href = '#';
settingsLink.innerText = 'privacy settings';
settingsLink.onclick = showPrivacyManager;
document.body.append(settingsLink);
