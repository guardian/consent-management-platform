/* eslint-disable functional/immutable-data */
// BRANDED LOGGING

const capitalize = (str) =>
	str.replace(/^([a-z])/, (match) => match.toUpperCase());

// we could use chalk, but this saves needing to pre-install it
// if this is a first run
const red = "\x1b[31m";
const blue = "\x1b[34m";
const yellow = "\x1b[33m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";

const logIt = (messages = [], color = dim) => {
	// eslint-disable-next-line no-console
	console.log(`${color}%s${reset}`, capitalize(messages.join("\n")));
};

const log = (...messages) => logIt(messages, blue);
const warn = (...messages) => logIt(messages, red);
const prompt = (...messages) => logIt(messages, yellow);

// can be used as a normal script too
const [, , messages, method] = process.argv;
if (messages) {
	switch (method) {
		case "warn":
			warn(messages);
			break;
		case "prompt":
			prompt(messages);
			break;
		default:
			log(messages);
			break;
	}
}

// exports for modules to use
module.exports = {
	log,
	warn,
	prompt,
};
