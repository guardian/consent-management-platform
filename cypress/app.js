import { cmp, onConsentChange } from '../dist/index';

document.body.style.fontFamily = 'sans-serif';

/* ************** library usage ************** */

// Mimic behaviour of real-world usage.
// We call everything more than once to make sure that doesn't break anything.

if (window.location.hash === '#tcfv2') localStorage.setItem('inUSA', 'false');
if (window.location.hash === '#ccpa') localStorage.setItem('inUSA', 'true');
const isInUsa = localStorage.getItem('inUSA') === 'true';

cmp.init({ isInUsa });

const list = document.createElement('ul');
list.style.fontFamily = 'monospace';

const appendListItem = (content) => {
	const element = document.createElement('li');
	element.innerHTML = content;
	list.appendChild(element);
};
appendListItem('List of events:');

onConsentChange((response) => {
	appendListItem(JSON.stringify(response));
});

cmp.willShowPrivacyMessage().then((willShow) => {
	appendListItem(`cmp.willShowPrivacyMessage: ${JSON.stringify(willShow)}`);
});

/* ************** test page controls ************** */

const locationLabel = document.createElement('label');
locationLabel.innerHTML = 'in USA';
locationLabel.style.display = 'flex';
locationLabel.style.flexDirection = 'row-reverse';
locationLabel.style.justifyContent = 'flex-end';

const locationControl = document.createElement('input');
locationControl.type = 'checkbox';
locationControl.dataset.cy = 'ccpa';
locationControl.checked = localStorage.getItem('inUSA') === 'true';
locationControl.onclick = () => {
	localStorage.setItem('inUSA', locationControl.checked.toString());
	window.location.reload();
};

locationLabel.appendChild(locationControl);
document.body.append(locationLabel);

const settingsButton = document.createElement('button');
settingsButton.dataset.cy = 'pm';
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

const purposes = document.createElement('ol');
purposes.style.display = 'flex';
purposes.style.flexWrap = 'wrap';
purposes.style.justifyContent = 'center';
purposes.style.listStyle = 'none';
purposes.style.margin = '1em';
purposes.style.padding = '0';
document.body.append(purposes);

onConsentChange((response) => {
	purposes.innerHTML = '';
	if (response.tcfv2?.consents) {
		Object.entries(response.tcfv2?.consents).forEach((entry) => {
			const [purpose, consent] = entry;
			const listItem = document.createElement('li');
			listItem.style.backgroundColor = consent ? 'lightgreen' : 'darksalmon';
			listItem.dataset.purpose = purpose.toString();
			listItem.dataset.consent = consent.toString();
			listItem.innerHTML = `Purpose ${purpose} &rarr; ${consent}`;
			purposes.appendChild(listItem);
		});
	}

	if (response.ccpa) {
		const { doNotSell } = response.ccpa;
		const listItem = document.createElement('li');
		listItem.style.backgroundColor = !doNotSell ? 'lightgreen' : 'darksalmon';
		listItem.dataset.donotsell = doNotSell.toString();
		listItem.innerHTML = `Do not sell &rarr; ${doNotSell}`;
		purposes.appendChild(listItem);
	}
});

const styles = document.createElement('style');
styles.innerHTML = `
 li {
	 width: 9em;
	 margin: 0.25em;
	 padding: 0.25em;
 }
`;
document.body.append(styles);

document.body.append(list);
