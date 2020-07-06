/* eslint-disable import/no-extraneous-dependencies */

import { cmp } from '../src/index';

cmp.willShowPrivacyMessage().then((willShow) => {
	console.log('DEV willShowPrivacyMessage', { willShow });
});

cmp.onConsent(({ tcf, ccpa }) => {
	console.log('DEV onConsent', { tcf, ccpa });
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
const settingsButton = document.createElement('button');
settingsButton.innerText = 'show privacy settings';
settingsButton.onclick = cmp.showPrivacyManager;
settingsButton.style.marginTop = '1rem';
document.body.append(settingsButton);
