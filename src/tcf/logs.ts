import { GuPurposeState } from './types';
import { readBwidCookie } from './cookies';
import { isProd } from './config';
import { handleError } from './error';

interface LogsPaylod {
	version: string;
	iab: string;
	source: string;
	purposes: { personalisedAdvertising: boolean };
	browserId: string;
	variant?: string;
}

const LOGS_VERSION = '1';
const DUMMY_BROWSER_ID = 'No bwid available';

const CMP_LOGS_PROD_URL = 'https://consent-logs.guardianapis.com/report';
const CMP_LOGS_NOT_PROD_URL =
	'https://consent-logs.code.dev-guardianapis.com/report';

export const postConsentState = (
	guState: GuPurposeState,
	iabString: string,
	pAdvertisingState: boolean,
	source: string,
	variant?: string,
): Promise<void> => {
	const CMP_LOGS_URL = isProd() ? CMP_LOGS_PROD_URL : CMP_LOGS_NOT_PROD_URL;

	const browserID = readBwidCookie() || DUMMY_BROWSER_ID;

	if (isProd() && browserID === DUMMY_BROWSER_ID) {
		handleError('Error getting browserID in PROD');
		return Promise.reject();
	}

	const logInfo: LogsPaylod = {
		version: LOGS_VERSION,
		iab: iabString,
		source,
		purposes: {
			personalisedAdvertising: pAdvertisingState,
		},
		browserId: browserID,
	};

	if (variant) {
		logInfo.variant = variant;
	}

	return fetch(CMP_LOGS_URL, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(logInfo),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`${response.status} | ${response.statusText}`);
			}
		})
		.catch((error) => {
			handleError(`Error posting to logs: ${error}`);
			return Promise.reject();
		});
};

export const _ = {
	CMP_LOGS_PROD_URL,
	CMP_LOGS_NOT_PROD_URL,
	DUMMY_BROWSER_ID,
	LOGS_VERSION,
};
