// CONSUMER SELF TEST CHANGES //

export { clickAcceptAllCookies, log_error, log_info, getCMPVersionRunning } from './consumer-self-test-commons';

// whenever this is exposed, it interferes with monitoring.
//export { selfTest } from './consumer-self-test';

// first attempt at code splitting.
// export const callConsumerSelfTest = async () => {
// 	const selfTest = await import('./consumer-self-test');
// 	await selfTest.selfTest('https://theguardian.com');
// };
