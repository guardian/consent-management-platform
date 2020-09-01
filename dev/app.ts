/* eslint-disable import/no-extraneous-dependencies */

import { cmp, onConsentChange } from '../src/index';

/* ************** debug tools ************** */

const logCall = (title: string, ...rest: unknown[]) =>
	// eslint-disable-next-line no-console
	console.info.apply(null, [`%c${title}()`, 'color: deeppink;', ...rest]);

const logResponse = (title: string, ...rest: unknown[]) =>
	// eslint-disable-next-line no-console
	console.log.apply(null, [
		`%c${title} %cresult`,
		'color: deeppink;',
		'',
		...rest,
	]);

/* ************** library usage ************** */

// Mimic behaviour of real-world usage.
// We call everything more than once to make sure that doesn't break anything.

logCall('cmp.willShowPrivacyMessage 1');
cmp.willShowPrivacyMessage().then((willShow) => {
	logResponse('cmp.willShowPrivacyMessage 1', { willShow });
});

logCall('onConsentChange 1');
onConsentChange((response) => {
	logResponse('onConsentChange 1', response);
});

const isInUsa = localStorage.getItem('inUSA') === 'true';
logCall('cmp.init 1', { isInUsa });
cmp.init({ isInUsa });

logCall('onConsentChange 2');
onConsentChange((response) => {
	logResponse('onConsentChange 2', response);
});

logCall('cmp.init 2', { isInUsa });
cmp.init({ isInUsa });

logCall('cmp.willShowPrivacyMessage 2');
cmp.willShowPrivacyMessage().then((willShow) => {
	logResponse('cmp.willShowPrivacyMessage 2', { willShow });
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
	logCall('cmp.showPrivacyManager');
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
