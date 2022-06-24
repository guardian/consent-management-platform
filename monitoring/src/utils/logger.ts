class Logger {
	/**
	 *
	 *
	 * @static
	 * @param {string} message
	 * @memberof Logger
	 */
	static info = (message: string): void => {
		console.log(message);
	};

	/**
	 *
	 *
	 * @static
	 * @param {string} error
	 * @memberof Logger
	 */
	static error = (error: string): void => {
		console.log(error);
	};

	/**
	 *
	 *
	 * @static
	 * @param {string} message
	 * @param {LogMessageType} logMessageType
	 * @memberof Logger
	 */
	static constructMessage = (
		message: string,
		logMessageType: LogMessageType,
	): string => {
		return `(cmp monitoring): ${Logger.getMessageType(
			logMessageType,
		)}: ${message}`;
	};

	/**
	 * To be finished. Need to understand object
	 *
	 * @static
	 * @memberof Logger
	 */
	static constructObject = (): void => {
		console.log('TODO');
	};

	/**
	 *
	 *
	 * @static
	 * @param {LogMessageType} logMessageType
	 * @memberof Logger
	 */
	static getMessageType = (logMessageType: LogMessageType): string => {
		switch (logMessageType) {
			case LogMessageType.INFO:
				return 'info';
			case LogMessageType.ERROR:
				return 'error';
			default:
				return '';
		}
	};
}

enum LogMessageType {
	INFO,
	ERROR,
}

export { Logger, LogMessageType };
