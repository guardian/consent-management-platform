/* eslint-disable import/no-extraneous-dependencies */

import { cmp, onConsentChange } from '../src/index';

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

logCall('cmp.willShowPrivacyMessage');
cmp.willShowPrivacyMessage().then((willShow) => {
	logResponse('cmp.willShowPrivacyMessage', { willShow });
});

logCall('onConsentChange');
onConsentChange((response) => {
	logResponse('onConsentChange', response);
});

const isInUsa = localStorage.getItem('inUSA') === 'true';
cmp.init({ isInUsa });
logCall('cmp.init', { isInUsa });

// *************** START commercial.dcr.js hotfix ***************
// init again to check hotfix
cmp.init({ isInUsa });
// *************** END commercial.dcr.js hotfix ***************

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
