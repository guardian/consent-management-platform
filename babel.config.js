module.exports = ({ env }) => {
	const isTest = env('test');

	const targets = isTest ? { node: 'current' } : null;

	return {
		presets: [['@babel/preset-env', { targets }], '@babel/preset-typescript'],
	};
};
