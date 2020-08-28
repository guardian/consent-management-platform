// https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#ping-status-codes

export type TCPingStatusCode =
	| 'stub'
	| 'loading'
	| 'loaded'
	| 'error'
	| 'visible'
	| 'hidden'
	| 'disabled';
