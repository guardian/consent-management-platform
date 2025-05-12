export class Log {
	static info(message) {
		console.log(`(cmp monitoring) info: ${message}`);
	}

	static error(message) {
		console.error(`(cmp monitoring) error: ${message}`);
	}

	static line() {
		console.log('--------------------------------------------------');
	}
}
