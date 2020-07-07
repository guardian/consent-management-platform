/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import { cmp, onConsentChange, ConsentManagementPlatform } from '../src/index';

cmp.willShowPrivacyMessage().then((willShow) => {
	console.log('DEV willShowPrivacyMessage', { willShow });
});

onConsentChange(({ tcfv2, ccpa }) => {
	console.log('DEV onConsent', { tcfv2, ccpa });
});

if (
	localStorage.getItem('inUSA') !== 'true' &&
	localStorage.getItem('oldCMP') === 'true'
) {
	document.body.insertAdjacentHTML('afterbegin', '<div id="app"/>');

	ReactDOM.render(
		<ConsentManagementPlatform onClose={() => {}} />,
		document.getElementById('app'),
	);
} else {
	cmp.init({ isInUsa: localStorage.getItem('inUSA') === 'true' });
}

const locationLabel = document.createElement('label');
locationLabel.innerHTML = 'in USA';
locationLabel.style.display = 'flex';
locationLabel.style.flexDirection = 'row-reverse';
locationLabel.style.justifyContent = 'flex-end';

const locationControl = document.createElement('input');
locationControl.type = 'checkbox';
locationControl.checked = localStorage.getItem('inUSA') === 'true';
locationControl.onclick = () => {
	localStorage.setItem('inUSA', locationControl.checked.toString());
	window.location.reload();
};

locationLabel.appendChild(locationControl);
document.body.append(locationLabel);

const stagingLabel = document.createElement('label');
stagingLabel.innerHTML = 'use staging campaign';
stagingLabel.style.display = 'flex';
stagingLabel.style.flexDirection = 'row-reverse';
stagingLabel.style.justifyContent = 'flex-end';

if (localStorage.getItem('staging') === null) {
	localStorage.setItem('staging', 'true');
	window.location.search = '_sp_env=stage';
}

const stagingControl = document.createElement('input');
stagingControl.type = 'checkbox';
stagingControl.checked = localStorage.getItem('staging') === 'true';
stagingControl.onclick = () => {
	localStorage.setItem('staging', stagingControl.checked.toString());
	window.location.search = stagingControl.checked ? '_sp_env=stage' : '';
};

stagingLabel.appendChild(stagingControl);
document.body.append(stagingLabel);

const versionLabel = document.createElement('label');
versionLabel.innerHTML = 'use current CMP for TCF';
versionLabel.style.display = 'flex';
versionLabel.style.flexDirection = 'row-reverse';
versionLabel.style.justifyContent = 'flex-end';

const versionControl = document.createElement('input');
versionControl.type = 'checkbox';
versionControl.checked = localStorage.getItem('oldCMP') === 'true';
versionControl.onclick = () => {
	localStorage.setItem('oldCMP', versionControl.checked.toString());
	window.location.reload();
};

versionLabel.appendChild(versionControl);
document.body.append(versionLabel);

const settingsButton = document.createElement('button');
settingsButton.innerText = 'show privacy settings';
settingsButton.onclick = cmp.showPrivacyManager;
settingsButton.style.marginTop = '1rem';
settingsButton.style.display = 'block';
document.body.append(settingsButton);

const resetButton = document.createElement('button');
resetButton.innerText = 'clear preferences';
resetButton.onclick = () => {
	document.cookie.split(';').forEach((cookie) => {
		document.cookie = cookie
			.replace(/^ +/, '')
			.replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
	});
	window.location.reload();
};
resetButton.style.marginTop = '1rem';
settingsButton.style.display = 'block';
document.body.append(resetButton);
