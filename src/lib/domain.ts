let isGuardian: boolean | undefined;

export const isGuardianDomain = (): boolean => {
	if (typeof isGuardian === 'undefined')
		isGuardian = /\.theguardian\.com$/.test(window.location.host);
	return isGuardian;
};
