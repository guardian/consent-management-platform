/* eslint-disable import/no-extraneous-dependencies */

import { cmp, onConsentChange } from '../src/index';

const call = (event: string, ...rest: unknown[]) =>
	// eslint-disable-next-line no-console
	console.info.apply(null, [`%c${event}()`, 'color: deeppink;', ...rest]);

const response = (event: string, ...rest: unknown[]) =>
	// eslint-disable-next-line no-console
	console.log.apply(null, [
		`%c${event} %cresult`,
		'color: deeppink;',
		'',
		...rest,
	]);

call('cmp.willShowPrivacyMessage');
cmp.willShowPrivacyMessage().then((willShow) => {
	response('cmp.willShowPrivacyMessage', { willShow });
});

call('onConsentChange');
onConsentChange(({ tcfv2, ccpa }) => {
	response('onConsentChange', { tcfv2, ccpa });
});

const isInUsa = localStorage.getItem('inUSA') === 'true';
cmp.init({ isInUsa });
call('cmp.init', { isInUsa });
// *************** START commercial.dcr.js hotfix ***************
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
	call('cmp.showPrivacyManager');
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
