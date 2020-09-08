/* eslint-disable import/no-extraneous-dependencies */

import { cmp, onConsentChange } from '../src/index';

/* ************** library usage ************** */

// Mimic behaviour of real-world usage.
// We call everything more than once to make sure that doesn't break anything.

const isInUsa = localStorage.getItem('inUSA') === 'true';

cmp.init({ isInUsa });

const pre = document.createElement('pre');
document.body.append(pre);

onConsentChange((response) => {
	pre.innerHTML += 'onConsentChange 2\n';
	pre.innerHTML += response;
});

cmp.willShowPrivacyMessage().then((willShow) => {
	pre.innerHTML += '\n\n';
	pre.innerHTML += 'cmp.willShowPrivacyMessage 2';
	pre.innerHTML += `${willShow}`;
});

/* ************** test page controls ************** */

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
settingsButton.innerText = 'open privacy settings';
settingsButton.onclick = () => {
	cmp.showPrivacyManager();
};
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
