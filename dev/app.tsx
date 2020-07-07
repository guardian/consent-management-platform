/* eslint-disable import/no-extraneous-dependencies */

import { cmp, onConsent } from '../src/index';

cmp.willShowPrivacyMessage().then((willShow) => {
	console.log('DEV willShowPrivacyMessage', { willShow });
});

onConsent(({ tcfv2, ccpa }) => {
	console.log('DEV onConsent', { tcfv2, ccpa });
});

cmp.init({ isInUsa: localStorage.getItem('inUSA') === 'true' });

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

const stagingControl = document.createElement('input');
stagingControl.type = 'checkbox';
stagingControl.checked = window.location.search === '?_sp_env=stage';
stagingControl.onclick = () => {
	window.location.search = stagingControl.checked ? '_sp_env=stage' : '';
};

stagingLabel.appendChild(stagingControl);
document.body.append(stagingLabel);

const settingsButton = document.createElement('button');
settingsButton.innerText = 'show privacy settings';
settingsButton.onclick = cmp.showPrivacyManager;
settingsButton.style.marginTop = '1rem';
settingsButton.style.display = 'block';
document.body.append(settingsButton);

const resetButton = document.createElement('button');
resetButton.innerText = 'clear settings';
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
