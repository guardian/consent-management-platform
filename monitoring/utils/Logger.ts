enum LogMessageType {
	INFO,
	ERROR
}

class Logger {
	static info = (message: string) : void => {
		console.log(message)
	}


	static error = (error: string) : void => {
		console.log(error)
	}


	static constructMessage = (message: string, logMessageType: LogMessageType) : string => {

		return `(cmp monitoring): ${Logger.getMessageType(logMessageType)}: ${message}`
	}

	/**
	 * To be finished. Need to understand object
	 *
	 * @static
	 * @memberof Logger
	 */
	static constructLoggerObject = () => {
		return {

		}
	}

	/**
	 *
	 *
	 * @static
	 * @param {LogMessageType} logMessageType
	 * @memberof Logger
	 */
	static getMessageType = (logMessageType: LogMessageType) : string  => {
		switch(logMessageType){
			case LogMessageType.INFO:
				return "info";
			case LogMessageType.ERROR:
				return "error";
			default:
				return ''
		}
	}
}


export default Logger;
